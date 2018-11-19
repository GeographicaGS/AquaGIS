package model

import java.sql.{Connection, DriverManager, ResultSet}
import java.util.logging.Logger

import org.postgresql.Driver
import utils.Time_utils

class TankDAO(url: String, username: String, password: String, schema: String) {

  // Variable para habilitar la impresión
  var debug = true


  DriverManager.registerDriver(new Driver)

  /**
    * Consulta completa de la tabla '''tank''' base de datos, construye los objetos Tank y los devuelve.
    *
    * @return devuelve un objeto Seq con todos los objetos Tank creados.
    */
  def listAllTanks(): Seq[Tank] = {
    var tanks: Seq[Tank] = Seq.empty[Tank]
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      val query_str = s"SELECT * FROM ${schema}.aq_cons_tank"
      Logger.getGlobal.info(query_str)
      val resultSet = statement.executeQuery(query_str)
      while (resultSet.next()) {
        tanks = tanks :+ new Tank(
          resultSet.getString("id_entity"),
          resultSet.getDouble("capacity"),
          resultSet.getDouble("min_level"),
          resultSet.getDouble("max_level"),
          resultSet.getDouble("pump_flow"),
          resultSet.getDouble("pump_power")
        )
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    tanks
  }

  /**
    * Devuelve un Seq con los id de sectores que son abastecidos por el reftank pasado por argumento.
    *
    * @param tank_id id del deṕosito del que queremos saber los sectores que abastece.
    *
    * @return devuelve un objeto Seq con todos los id de sectores que abastece.
    */
  def listSectorsByTankId(tank_id: String): Seq[String] = {
    var listSectors: Seq[String] = Seq.empty[String]
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      val query_str = s"SELECT id_entity FROM ${schema}.aq_cons_sector_lastdata WHERE reftank='${tank_id}'"
      Logger.getGlobal.info(query_str)
      val resultSet = statement.executeQuery(query_str)

      while (resultSet.next()) {
        listSectors = listSectors :+ resultSet.getString("id_entity")
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    listSectors
  }

  /**
    * Dado un depósito por medio de su id_entity, consulta la tabla '''aq_cons_tank_measurand''' para obtener la capacidad del depósito en m3 al comienzo del día.
    *
    * @note la hora de comienzo del día viene definida por la variable startTimestamp.
    *
    * @param id_entity id del deṕosito del que queremos consultar.
    *
    * @return devuelve el texto de timestamp y m3 correspondientes.
    */

  def startLevel_m3_ByTankId(id_entity: String): (String, Double) = {
    var res: (String, Double) = ("", 0.0)
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      var query_str = s"SELECT " + "\"TimeInstant\"" + s", level FROM ${schema}.aq_cons_tank_measurand WHERE id_entity='${id_entity}' AND " + "\"TimeInstant\"" + s"='${Time_utils.startTimestamp}'"
      Logger.getGlobal.info(query_str)
      var resultSet = statement.executeQuery(query_str)

      if (resultSet.next())
        res = (resultSet.getString("TimeInstant"), resultSet.getDouble("level"))

      query_str = s"SELECT capacity FROM ${schema}.aq_cons_tank WHERE id_entity='${id_entity}'"
      Logger.getGlobal.info(query_str)

      resultSet = statement.executeQuery(query_str)
      if (resultSet.next()) {
        val capacidad = resultSet.getDouble("capacity")
        res = (res._1, res._2 * capacidad / 100.0)
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    res
  }

  /**
    * Dado un depósito por medio de su id_entity, consulta la tabla '''aq_cons_sector_agg_hour''' para devolver las predicciones del día en curso, agregadas de todos los sectores que abastece dicho depósito
    *
    * @param tank_id_entity id del deṕosito del que queremos consultar.
    *
    * @return Secuencia de pares (timestamp, m3) de las 24h del día con los consumos previstos del depósito.
    */
  def loadAggregatedForecastFromSectorsByTankId(tank_id_entity: String): Seq[(String, Double)] = {
    val sectorsIdList: Seq[String] = listSectorsByTankId(tank_id_entity)
    var forecastAcumuladoDelTanque: Seq[(String, Double)] = Seq.empty[(String, Double)]
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      sectorsIdList.map { sector_id =>
        var forecastDeTodosLosSectores = Seq.empty[(String, Double)]

        val query_str = s"SELECT " + "\"TimeInstant\"" + s", consumption FROM ${schema}.aq_cons_sector_agg_hour WHERE id_entity='${sector_id}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<='${Time_utils.endTimestamp}'"
        Logger.getGlobal.info(query_str)
        val resultSet = statement.executeQuery(query_str)

        while (resultSet.next()) {
          forecastDeTodosLosSectores = forecastDeTodosLosSectores :+ (resultSet.getString("TimeInstant"), resultSet.getDouble("consumption"))
        }
        // Se agrupan los datos de cada sector para acumularlos por cada hora
        forecastAcumuladoDelTanque = forecastDeTodosLosSectores.groupBy(_._1).toSeq.map { case (time, list) =>
          val total = list.map(_._2).sum
          (time, total)
        }
        forecastAcumuladoDelTanque
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    forecastAcumuladoDelTanque
  }

  /**
    * Dado un depósito por medio de su id_entity y la tabla a consultar en función del tipo de planificador, se devuelven los m3 llenados por la planificación hasta el momento actual.
    *
    * @param tank_id_entity id del deṕosito del que queremos consultar.
    * @param table          nombre de la tabla que contiene los llenados programados, según el tipo de planificador.
    *
    * @return cantidad de m3 llenados.
    */
  def load_m3_llenadosProgramados_ByTankId(tank_id_entity: String, table: String): Double = {
    var llenadoAcumulado: Double = 0.0

    //Buscamos la primera emergencia del dia, para descartar los llenados planificados a partir de ahí
    val pumpEmergencies = loadPumpEmergenciesUntilCurrentTimeByTankId(tank_id_entity)
    val firstEmergency: (String, Boolean) = if (pumpEmergencies.nonEmpty) {
      pumpEmergencies.head
    } else {
      ("", false)
    }
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      var tiemposDellenado = Seq.empty[(String, Boolean)]
      var resultSet: ResultSet = null

      if (firstEmergency._1 != "") {
        val query_str = s"SELECT " + "\"TimeInstant\"" + s", activated FROM ${schema}.${table} WHERE id_entity='${tank_id_entity}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<='${firstEmergency._1}'"
        Logger.getGlobal.info(query_str)
        resultSet = statement.executeQuery(query_str)
      } else {
        val query_str = s"SELECT " + "\"TimeInstant\"" + s", activated FROM ${schema}.${table} WHERE id_entity='${tank_id_entity}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<='${Time_utils.currentTimestamp}'"
        Logger.getGlobal.info(query_str)
        resultSet = statement.executeQuery(query_str)

      }
      while (resultSet.next()) {
        val res = (resultSet.getString("TimeInstant"), resultSet.getBoolean("activated"))
        if (res._1 == Time_utils.currentTimestamp && res._2 == true) {
          // En la consulta se ha tenido que incluir currenttime para poder detectar las ordenes de detener el llenado. Si la orden en currenttime es de llenar no se tiene en cuenta
        } else {
          tiemposDellenado = tiemposDellenado :+ res
        }
      }
      // Procesamos los tiempos de activación, pasando los minutos llenados a m3
      if (tiemposDellenado.size % 2 != 0) {
        tiemposDellenado = tiemposDellenado :+ (Time_utils.currentTimestamp, false)
      }
      var minutos: Int = 0
      val array = tiemposDellenado.toArray
      for (i <- 0 until array.size by 2) {
        val ini = Time_utils.convertStringToTimestamp(array(i)._1)
        val fin = Time_utils.convertStringToTimestamp(array(i + 1)._1)
        minutos = minutos + ((fin.getTime - ini.getTime) / 1000 / 60).toInt
      }

      val query_str = s"SELECT pump_flow FROM ${schema}.aq_cons_tank WHERE id_entity='${tank_id_entity}'"
      Logger.getGlobal.info(query_str)
      resultSet = statement.executeQuery(query_str)

      resultSet.next()
      val pump_flow = resultSet.getDouble("pump_flow")
      llenadoAcumulado = minutos * pump_flow / 60.0
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    llenadoAcumulado
  }

  /**
    * Dado un depósito por medio de su id, se consulta la tabla '''aq_plan_tank_pump_emergency''' para calcular los m3 llenados por el motor de emergencia hasta el momento actual.
    *
    * @param tank_id_entity id del deṕosito del que queremos consultar.
    *
    * @return cantidad de m3 llenados.
    */
  def load_m3_llenadosDeEmergencia_ByTankId(tank_id_entity: String): Double = {
    var llenadoAcumulado: Double = 0.0
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      var tiemposDellenado = Seq.empty[(String, Boolean)]

      var query_str = s"SELECT " + "\"TimeInstant\"" + s", activated FROM ${schema}.aq_plan_tank_pump_emergency WHERE id_entity='${tank_id_entity}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<='${Time_utils.currentTimestamp}'"
      Logger.getGlobal.info(query_str)
      var resultSet = statement.executeQuery(query_str)

      while (resultSet.next()) {
        val res = (resultSet.getString("TimeInstant"), resultSet.getBoolean("activated"))
        if (res._1 == Time_utils.currentTimestamp && res._2 == true) {
        } else {
          tiemposDellenado = tiemposDellenado :+ res
        }
      }
      // Se procesan los tiempos de activación, pasando los minutos a m3
      if (tiemposDellenado.size % 2 != 0) {
        tiemposDellenado = tiemposDellenado :+ (Time_utils.currentTimestamp, false)
      }
      var minutos: Int = 0
      val array = tiemposDellenado.toArray
      for (i <- 0 until array.size by 2) {
        val ini = Time_utils.convertStringToTimestamp(array(i)._1)
        val fin = Time_utils.convertStringToTimestamp(array(i + 1)._1)
        minutos = minutos + ((fin.getTime - ini.getTime) / 1000 / 60).toInt
      }

      query_str = s"SELECT pump_flow FROM ${schema}.aq_cons_tank WHERE id_entity='${tank_id_entity}'"
      Logger.getGlobal.info(query_str)
      resultSet = statement.executeQuery(query_str)

      resultSet.next()
      val pump_flow = resultSet.getDouble("pump_flow")
      llenadoAcumulado = minutos * pump_flow / 60.0
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    llenadoAcumulado
  }

  /**
    * Dado un depósito por medio de su id y la tabla a consultar en función del tipo de planificador, se devuelve el timestamp actual con la capacidad actual en m3, habiendo considerado los consumos reales, los llenados planidicados y los de emergencia.  llenados por la planificación hasta el momento actual.
    *
    * @param tank_id id del deṕosito del que queremos consultar.
    * @param table   nombre de la tabla que contiene los llenados programados, según el tipo de planificador.
    *
    * @return devuelve el timestamp actual junto con la capacidad actual del depósito en m3.
    */
  def loadLastLevelByTankId(tank_id: String, start_level: Double, table: String): (String, Double) = {
    val sectorsIdList: Seq[String] = listSectorsByTankId(tank_id)
    //    val start_level: (String, Double) = startLevel_m3_ByTankId(tank_id)
    var consumoAcumuladoRealDelTanque: (String, Double) = ("", 0.0)
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      val consumoAcumuladoPorSector: Seq[(String, String, Double)] = sectorsIdList.map { sector_id =>
        var consumosPorSector = Seq.empty[(String, Double)]

        val query_str = s"SELECT " + "\"TimeInstant\"" + s", consumption FROM ${schema}.aq_cons_sector_agg_hour WHERE id_entity='${sector_id}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<'${Time_utils.currentTimestamp}'"
        Logger.getGlobal.info(query_str)
        val resultSet = statement.executeQuery(query_str)

        while (resultSet.next()) {
          consumosPorSector = consumosPorSector :+ (resultSet.getString("TimeInstant"), resultSet.getDouble("consumption"))
        }
        (sector_id, consumosPorSector.last._1, consumosPorSector.map(_._2).sum)
      }
      // Se acumulan los datos de cada sector
      consumoAcumuladoRealDelTanque = (consumoAcumuladoPorSector.last._2, consumoAcumuladoPorSector.map(_._3).sum)
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    (Time_utils.currentTimestamp, start_level - consumoAcumuladoRealDelTanque._2 + load_m3_llenadosProgramados_ByTankId(tank_id, table) + load_m3_llenadosDeEmergencia_ByTankId(tank_id))
  }


  /**
    * Se consulta la tabla '''aq_aux_energy_prices''' para obtener los precios de la energía en el día actual.
    *
    * @return devuelve una estructura con los pares (timestamp, precio)
    */
  def getEnergyPrice(): Seq[(String, Double)] = {
    var energy_price: Seq[(String, Double)] = Seq.empty[(String, Double)]
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      val query_str = s"SELECT " + "\"TimeInstant\"" + s", price FROM ${schema}.aq_aux_energy_prices WHERE " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<='${Time_utils.endTimestamp}'"
      Logger.getGlobal.info(query_str)
      val resultSet = statement.executeQuery(query_str)

      while (resultSet.next()) {
        energy_price = energy_price :+ (resultSet.getString("TimeInstant"), resultSet.getDouble("price"))
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    energy_price
  }


  /**
    * Se escribe en base de datos la secuencia de activaciones y detenciones del llenado de un depósito, utilizando la tabla que correspond según el tipo de planificador.
    *
    * @param tank_id         id del deṕosito.
    * @param tank_activation secuencia de activaciones y detenciones del llenado del depósito. Contiene los pares de (timestamp, orden)
    * @param table           nombre de la tabla donde escribir los llenados programados, según el tipo de planificador.
    */
  def saveForecast(tank_id: String, tank_activation: Seq[(String, Boolean)], table: String): Unit = {
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()
      tank_activation foreach { case (timeInstant, activated) =>

        val query_str = s"INSERT INTO $schema.$table (id_entity, " + "\"TimeInstant\"" + s", activated) VALUES ('$tank_id', '$timeInstant', $activated)"
        Logger.getGlobal.info(query_str)
        statement.executeUpdate(query_str)
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
  }

  /**
    * Se escribe en base de datos acción de activar o detener el llenado para un depósito al momento de cierto timestamp.
    *
    * @param tank_id     id del deṕosito.
    * @param timeInstant timestamp de la acción.
    * @param activated   orden de la acción (true=activar, false=detener).
    */
  def saveEmergency(tank_id: String, timeInstant: String, activated: Boolean): Unit = {
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      val query_str = s"INSERT INTO $schema.aq_plan_tank_pump_emergency (id_entity, " + "\"TimeInstant\"" + s", activated) VALUES ('$tank_id', '$timeInstant', $activated)"
      Logger.getGlobal.info(query_str)
      statement.executeUpdate(query_str)

    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
  }

  /**
    * Se consulta en la base de datos la secuencia de acciones del motor de emergencia de un depósito, desde el inicio del día en curso hasta el momento actual.
    *
    * @param tank_id_entity id del deṕosito.
    *
    * @return estructura con la secuencia de acciones que han tenido lugar, en pares (timestamp, orden).
    */
  def loadPumpEmergenciesUntilCurrentTimeByTankId(tank_id_entity: String): Seq[(String, Boolean)] = {
    var pumpEmergenciesUntilCurrentTime: Seq[(String, Boolean)] = Seq.empty
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      val query_str = s"SELECT " + "\"TimeInstant\"" + s", activated FROM ${schema}.aq_plan_tank_pump_emergency WHERE id_entity='${tank_id_entity}' AND " + "\"TimeInstant\"" + s">='${Time_utils.startTimestamp}' AND " + "\"TimeInstant\"" + s"<'${Time_utils.currentTimestamp}'"
      Logger.getGlobal.info(query_str)
      val resultSet = statement.executeQuery(query_str)

      while (resultSet.next()) {
        pumpEmergenciesUntilCurrentTime = pumpEmergenciesUntilCurrentTime :+ (resultSet.getString("TimeInstant"), resultSet.getBoolean("activated"))
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    pumpEmergenciesUntilCurrentTime
  }

  /**
    * Se consulta en la base de datos la secuencia de acciones del motor de emergencia de un depósito, desde el día anterior (hasta startTimestamp).
    *
    * @param tank_id id del deṕosito.
    *
    * @return estructura con la secuencia de acciones que han tenido lugar, en pares (timestamp, orden).
    */
  def loadPumpEmergenciesOfYesterdayByTankId(tank_id: String): Seq[(String, Boolean)] = {
    var pumpEmergenciesUntilCurrentTime: Seq[(String, Boolean)] = Seq.empty
    var connection: Connection = null
    try {
      connection = DriverManager.getConnection(url, username, password)
      val statement = connection.createStatement()

      val yesterdayStartTimestamp = Time_utils.addMinutesToString(Time_utils.startTimestamp, -60)

      val query_str = s"SELECT " + "\"TimeInstant\"" + s", activated FROM ${schema}.aq_plan_tank_pump_emergency WHERE id_entity='${tank_id}' AND " + "\"TimeInstant\"" + s">='${yesterdayStartTimestamp}' AND " + "\"TimeInstant\"" + s"<='${Time_utils.startTimestamp}'"
      Logger.getGlobal.info(query_str)
      val resultSet = statement.executeQuery(query_str)

      while (resultSet.next()) {
        pumpEmergenciesUntilCurrentTime = pumpEmergenciesUntilCurrentTime :+ (resultSet.getString("TimeInstant"), resultSet.getBoolean("activated"))
      }
    } catch {
      case e: Exception => e.printStackTrace()
    }
    connection.close()
    pumpEmergenciesUntilCurrentTime
  }
}
