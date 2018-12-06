package model

import java.sql._
import java.time.{DayOfWeek, LocalDateTime}
import java.util.logging.Logger

import utils.Time_utils

import scala.collection.mutable.ListBuffer

/** Clase del Objeto de Acceso a Datos de una construcción
  *
  * @param url     : dirección de la Base de Datos
  * @param username: nombre de usuario
  * @param password: contraseña de acceso
  * @param schema  : esquema de la Base de Datos
  */
class ConstructionDAO(url: String, username: String, password: String, schema: String) {

  private var connection: Connection = _
  private var ptmt: PreparedStatement = _
  private var resultSet: ResultSet = _

  /** Crea una conexión a la Base de Datos llamando a ConnectionFactory
    *
    * @return conexión a la Base de Datos
    */
  private def getConnection = {
    ConnectionFactory.apply(url, username, password).getConnection
  }

  /** Consulta todas las construcciones de la tabla '''aq_cons_const_lastdata'''
    *
    * @return devuelve una colección de construcciones
    */
  def findAll(): Set[Construction] = {
    var res = Set.empty[Construction]
    try {
      val queryString = s"SELECT id_entity, refsector, refplot, usage FROM $schema.aq_cons_const_lastdata"
      Logger.getGlobal.info(queryString)

      connection = getConnection
      ptmt = connection.prepareStatement(queryString)
      resultSet = ptmt.executeQuery
      while (resultSet.next) {
        val id_entity: String = resultSet.getString("id_entity")
        val refsector: String = resultSet.getString("refsector")
        val refplot: String = resultSet.getString("refplot")
        val usage: String = resultSet.getString("usage")

        res = res + Construction.apply(id_entity, refsector, refplot, usage)
      }
      res
    } catch {
      case e: SQLException =>
        e.printStackTrace()
        res
    } finally try {
      if (resultSet != null) resultSet.close()
      if (ptmt != null) ptmt.close()
      if (connection != null) connection.close()
      res
    } catch {
      case e: SQLException =>
        e.printStackTrace()
      case e: Exception =>
        e.printStackTrace()
        res
    }
  }


  /** Consulta la tabla '''aq_cons_const_agg_hour''' de una construcción indentificada por su '''id_entity''' y
    * devuelve los datos hasta el día de hoy al cierre.
    *
    * @param id_entity: identificador de la construcción
    *
    * @return secuencia de datos (timeinstant, consumption, forecast, pressure_forecast, pressure_agg) de la construcción.
    *         Sólo datos hasta completar el día en curso.
    */
  def getHistoryUntilTonightById(id_entity: String): Seq[(Timestamp, Float, Float, Float, Float)] = {
    //@val lista de registros
    val lista = ListBuffer.empty[(Timestamp, Float, Float, Float, Float)]

    val queryString: String = s"SELECT ${"\"TimeInstant\""}, consumption, forecast, pressure_forecast, pressure_agg " +
      s"FROM $schema.aq_cons_const_agg_hour " +
      s"WHERE id_entity='$id_entity' " +
      s"AND ${"\"TimeInstant\""}<'${Time_utils.tomorrowStartString}' " //+ s"ORDER BY ${"\"TimeInstant\""}"

    Logger.getGlobal.info(queryString)
    connection = getConnection
    ptmt = connection.prepareStatement(queryString)
    resultSet = ptmt.executeQuery

    while (resultSet.next) {
      val timeinstant: Timestamp = resultSet.getTimestamp("TimeInstant")
      val consumption: Float = resultSet.getFloat("consumption")
      val forecast: Float = resultSet.getFloat("forecast")
      val pressure_forecast: Float = resultSet.getFloat("pressure_forecast")
      val pressure_agg: Float = resultSet.getFloat("pressure_agg")
      lista.append((timeinstant, consumption, forecast, pressure_forecast, pressure_agg))
    }
    lista.sortBy(x => Time_utils.timestampToString(x._1))
  }

  /** Guarda una secuencia de predicciones (forecast, pressure_forecast) de cierta construcción en la tabla '''aq_cons_const_agg_hour'''
    *
    * @param id_entity   : identificador de la construcción
    * @param forecastList: secuencia de valores (forecast, pressure_forecast) con las predicciones de consumo y presión respectivamente.
    *                    El primer elemento se corresponde con la primera predicción del día siguiente
    */
  def saveForecastList(id_entity: String, forecastList: Seq[(Float, Float)], h: Int): Unit = {
    // @val firstLocalDateTime: Fecha y hora del la primera predicción
    val firstLocalDateTime: LocalDateTime = Time_utils.tomorrowStartLocalDateTime
    // Dada la fecha y hora de la primera predicción, se construyen las siguientes fechas sumando de hora en hora
    // val times: secuencia de fecha-horas
    val times: Seq[LocalDateTime] = for {
      i <- 0 to forecastList.size
    } yield firstLocalDateTime.plusHours(i)
    // Emparejamos los timeinstant con las predicciones
    var toSave: Seq[(LocalDateTime, (Float, Float))] = times.zip(forecastList)
    // Hay que controlar si persistimos en base de datos todas las predicciones o no. Hasta ahora, se han predicho los 14 días siguientes,
    // pero los requisitos del problema indican que de Lunes a Sábado no necesitamos un horizonte tan lejano. Primero calcularemos
    // cuántos días necesitamos, y desecharemos las predicciones que son lejanas.
    // @var days: Número de días siguientes al actual de los que queremos almacenar sus predicciones
    var days: Int = 0
    Time_utils.todayStartLocalDateTime.getDayOfWeek match {
      case DayOfWeek.SUNDAY => days = h / 24
      case _ => days = h / 24 - Time_utils.todayStartLocalDateTime.getDayOfWeek.getValue
    }

    // @val doNotPredict: Hora que tendrá la primera predicción que vamos a descartar.
    val doNotPredict = Time_utils.todayStartLocalDateTime.plusDays(days + 1)

    // De todas las predicciones, sólo nos quedamos con las anteriores a "doNotPredict"
    toSave = toSave.takeWhile(x => x._1.isBefore(doNotPredict))
    try {
      val queryString = s"INSERT INTO $schema.aq_cons_const_agg_hour (id_entity, " + "\"TimeInstant\"" + ", forecast, pressure_forecast) " +
        s"VALUES (?,?,?,?) ON CONFLICT DO NOTHING"
      Logger.getGlobal.info(queryString)
      connection = getConnection
      ptmt = connection.prepareStatement(queryString)
      toSave foreach { values =>
        ptmt.setString(1, id_entity)
        ptmt.setTimestamp(2, Time_utils.localDateTimeToTimestamp(values._1))
        ptmt.setFloat(3, values._2._1)
        ptmt.setFloat(4, values._2._2)
        ptmt.addBatch()
      }
      ptmt.executeBatch()
    } catch {
      case e: BatchUpdateException => throw e.getNextException()
      case e: Exception => e.printStackTrace()
    } finally try {
      if (ptmt != null) ptmt.close()
      if (connection != null) connection.close()
    } catch {
      case e: SQLException => e.printStackTrace()
      case e: Exception => e.printStackTrace()
    }
  }
}