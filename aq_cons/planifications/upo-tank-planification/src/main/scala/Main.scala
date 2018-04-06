import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Calendar

import controller.{Emergency_engine, Not_optimized_engine, Optimized_engine}
import model.{Tank, TankDAO}
import utils.Time_utils

object Main {

  var url: String = null
  var username: String = null
  var password: String = null
  var schema: String = null

  /**
    * Parsea las variables de entorno para asegurar que están establecidas (no se verifica que el contenido de las variables sea correcto).
    * Si no se satisfacen las restricciones se lanza una excepción.
    *
    * @note @throws IllegalArgumentException excepción lanzada por una variable establecida con longitud cero.
    * @note @throws NullPointerException excepción lanzada por no estar establecida una variable.
    */
  @throws(classOf[IllegalArgumentException])
  @throws(classOf[NullPointerException])
  def parseEnvVar(): Unit = {
    url = System.getenv.get("URL")
    username = System.getenv.get("USERNAME")
    password = System.getenv.get("PASSWORD")
    schema = System.getenv.get("SCHEMA")

    var envVarEmpty: Boolean = (url.isEmpty || username.isEmpty || password.isEmpty || schema.isEmpty)
    if (envVarEmpty) {
      var envVar: String = s"URL=$url,\nUSERNAME=$username,\nPASSWORD=$password,\nSCHEMA=$schema"
      println(s"Your environmental variables are: \n${envVar}\n")

      throw new IllegalArgumentException(s"Invalid environmental variables: \n${envVar}\n")
    }
  }


  /**
    * Función principal del program.
    *
    * @param args argumentos de entrada.
    */
  def main(args: Array[String]): Unit = {

    parseEnvVar()
    /*
    // DESCOMENTAR EL BLOQUE EN FASE DE PREPRODUCCIÓN, PARA UTILIZAR LA HORA DEL SISTEMA CON LA BASE DE DATOS ACTUALIZADA EN TIEMPO REAL
    // Obtenemos la hora actual del sistema, ignorando los minutos y segundos (para sincronizarnos con la frecuencia de los registros de la BD, que son horarios)
    // Además, situamos la hora del planificador en la hora siguiente
    // (Si el programa se ejecuta a las 23:55, se realiza la planificación desde las 00:00, para que a la hora en punto esté la ejecución terminada y ttodo planificado)
    val init_time = new SimpleDateFormat("yyyy-MM-dd HH:00:00").format(new Timestamp(System.currentTimeMillis))
    val hora_planificador = Time_utils.addMinutesToString(init_time,60)


    // según la hora del planificador, se establece en la variable estática "currentTimestamp",
    // se calculan la hora de comienzo del día (variable "startTimestamp", a las 00:00:00)
    // y la última hora del día (variable "endTimestamp", a las 23:00:00)
    Time_utils.syncTimesTo(hora_planificador)
*/

    // SÓLO EN FASE DE DESAROLLO
    // En fase de desarrollo, establecemos la hora de inicio justo antes del primer registro de la base de datos, para recorrerla completa con el while
    // La llave del while termina en línea 169
    val init_time = new SimpleDateFormat("yyyy-MM-dd HH:00:00").format(new Timestamp(System.currentTimeMillis)) // "2017-12-31 23:00:00" // System.getTime()
    Time_utils.syncTimesTo(init_time)
    val start = Time_utils.startTimestamp
    println(s"Hora de comienzo: $start")

    val c = Calendar.getInstance
    c.setTimeInMillis(Time_utils.convertStringToTimestamp(init_time).getTime)
    c.add(Calendar.DAY_OF_MONTH, 1)
    val tomorrow = c.getTimeInMillis

    var end = if(init_time == Time_utils.endTimestamp) tomorrow else System.currentTimeMillis
    var end_str = new SimpleDateFormat("yyyy-MM-dd 23:00:00").format(new Timestamp(end))
    println(s"Hora de fin: $end_str")
    
    while (Time_utils.currentTimestamp != end_str) {
      Time_utils.syncTimesTo(Time_utils.addMinutesToString(Time_utils.currentTimestamp, 60))

      // Creamos el Objeto de Acceso a Datos de los depósitos, pasando los datos dela conexión
      val tankDAO = new TankDAO(url, username, password, schema)

      /** OBTENER TODOS LOS TANQUES **/
      // Consulta completa de la tabla "tank" base de datos, construye los objetos Tank y los devuelve en una lista.
      val tanks: Seq[Tank] = tankDAO.listAllTanks()


      /** CONTROL DE INICIO DE DIA O MONITORIZACION **/
      // Ejecución condicional:
      // OPC A. Si es el comienzo del día, se ejecutarán los planificadores
      // OPC B. Si no, se activa el motor de emergencia/mantenimiento
      if (Time_utils.currentTimestamp.endsWith(" 00:00:00")) {
        // Entramos en OPC A. (Si es el comienzo del día, se ejecutarán los planificadores)

        /** OBTENER EL PRECIO DE LA ENERGIA **/
        val energy_price: Seq[(String, Double)] = tankDAO.getEnergyPrice()

        /** OBTENER STARTLEVEL, LOS SECTORES QUE ABASTECE, Y EL CONSUMO PREVISTO DE CADA TANQUE **/
        // Con el comando "foreach" iteramos sobre todos los depósitos de la lista "tanks", actualizando cada objeto "tank" con los siguientes valores:
        // @val startLevel_m3: Capacidad del depósito en m3 al comienzo del día.
        // @val sectorsIdList: Lista con los id de sectores que son abastecidos por el depósito que estamos iterando.
        // @val forecast: Predicciones agregadas de todos los sectores que abastece dicho depósito del consumo para el día en curso.
        // @val lastLevel_m3: nivel actual. Como estamos en el inicio del día, es igual que la variable "startLevel_m3"
        tanks foreach { tank =>
          val startLevel_m3: (String, Double) = tankDAO.startLevel_m3_ByTankId(tank.id)
          val sectorsIdList: Seq[String] = tankDAO.listSectorsByTankId(tank.id)
          val forecast: Seq[(String, Double)] = tankDAO.loadAggregatedForecastFromSectorsByTankId(tank.id)
          val lastLevel_m3: (String, Double) = startLevel_m3

          tank.setStart_level_m3(startLevel_m3)
          tank.setSectors(sectorsIdList)
          tank.setForecastForCurrentDay(forecast)
          tank.setCurrentLevel_m3(lastLevel_m3)
        }

        /** LANZAR EL ALGORITMO **/
        // El objetivo es recorrer todos los depósitos, realizando las dos planificaciones.
        //
        // En primer lugar, se comprueba si el nivel del depósito está por debajo del umbral y hay que ejecutar el motor de emergencia.
        // Ejecución condicional:
        // OPC A. El nivel del depósito está por debajo del umbral, por lo que se activa el motor de emergencia.
        // OPC B. Si no, nos aseguramos de que al empezar el día, los llenados de emergencia estén parados.
        //
        // En cualquier caso, se realizan las planificaciones.
        //
        // Con el comando "foreach" iteramos sobre todos los depósitos de la lista "tanks", y por cada objeto "tank", aplicamos la lógica descrita anteriormente.
        tanks foreach { tank =>

          if (tank.currentLevel_m3._2 < tank.min_level * tank.capacity / 100.0) {
            // Entramos en OPC A. (El nivel del depósito está por debajo del umbral, por lo que se activa el motor de emergencia)
            Emergency_engine(tankDAO, tank)
          } else {
            // Entramos en OPC B. (Nos aseguramos de que al empezar el día, los llenados de emergencia estén parados, consultando el último registro de la tabla "tank_pump_emergency")
            // @val lastEmergencies: Lista de las últimas emergencias desde el día de ayer.
            // @val lastEmergency: Última emergencia.
            var lastEmergency = ("", false)
            val lastEmergencies: Seq[(String, Boolean)] = tankDAO.loadPumpEmergenciesOfYesterdayByTankId(tank.id)
            if (lastEmergencies.nonEmpty) {
              lastEmergency = lastEmergencies.sortBy(_._1).last
            }

            // Si no terminó de llenarse y continua con el llenado, detenemos el llenado de emergencia,
            // puesto que al inicio del día será el motor de planificación el que decida si es el momento de seguir llenando,
            // teniendo en cuenta el precio de la energía.
            if (lastEmergency._1 != "" && lastEmergency._2 == true) {
              tankDAO.saveEmergency(tank.id, Time_utils.currentTimestamp, false)
            }
          }

          // En cualquier caso, se realizan las planificaciones.
          Not_optimized_engine(tankDAO, tank, energy_price)
          Optimized_engine(tankDAO, tank, energy_price)
        }

      } else {
        // Entramos en OPC B. (No es el inicio el día, por lo que no se planifica. Sólo se activa el motor de emergencia/mantenimiento)

        /** OBTENER STARTLEVEL, LOS SECTORES QUE ABASTECE, Y EL NIVEL REAL DE CADA TANQUE **/
        // Con el comando "foreach" iteramos sobre todos los depósitos de la lista "tanks", actualizando cada objeto "tank" con los siguientes valores:
        // @val startLevel_m3: Capacidad del depósito en m3 al comienzo del día.
        // @val sectorsIdList: Lista con los id de sectores que son abastecidos por el depósito que estamos iterando.
        // @val lastLevel_m3: nivel actual. Como estamos en el inicio del día, es igual que la variable "startLevel_m3"
        tanks foreach { tank =>
          val startLevel_m3: (String, Double) = tankDAO.startLevel_m3_ByTankId(tank.id)
          val sectorsIdList: Seq[String] = tankDAO.listSectorsByTankId(tank.id)
          val lastLevel_m3: (String, Double) = tankDAO.loadLastLevelByTankId(tank.id, "aq_plan_tank_pump_opt")
          tank.setStart_level_m3(startLevel_m3)
          tank.setSectors(sectorsIdList)
          tank.setCurrentLevel_m3(lastLevel_m3)
        }

        // Una vez cargados los datos necesarios de la BD, se recorren los depósitos activando en modo mantenimiento, por si se rebasase el umbral mínimo.
        // Con el comando "foreach" iteramos sobre todos los depósitos de la lista "tanks", y para cada objeto "tank", lanzamos el motor de mantenimiento/emergencia
        tanks foreach { tank => Emergency_engine(tankDAO, tank) }
      }
    }
  }
}
