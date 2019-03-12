import java.util.logging.{Level, Logger}

import model.{Construction, ConstructionDAO}
import wknn.Wknn

object Main {
  System.setProperty("java.util.logging.SimpleFormatter.format", "[%1$tF %1$tT] [%4$-7s] %5$s %n")

  var url: String = null
  var username: String = null
  var password: String = null
  var schema: String = null
  var predecirSemanas: String = null

  var h: Int = 24 * 7
  val w: Int = 24 * 7  // 168 valores del patrón de comportamiento
  val d: Int = 24 * 7
  val k: Int = 1

  /**
    * Función principal del programa. Completa las predicciones de hasta los 14 días posteriores.
    *
    * Nota: Cuando el valor real del consumo esté ausente, se consideran las precidicciones como valores reales.
    *
    * @param args argumentos de entrada. No recibe parámetros, se utilizan variables de entorno en su lugar.
    */
  def main(args: Array[String]): Unit = {

    parseEnvVar()



    run()

  }


  def run(): Unit = {

    // Creamos el Objeto de Acceso a Datos con los parámetros de conexión
    val constructionDAO = new ConstructionDAO(url, username, password, schema)

    var page = 0
    val page_size = 50
    var all_constructions: Set[Construction] = null

    do {
      // Consultamos la tabla "aq_cons_const_lastdata" para obtener las principales características de las construcciones
    // @val all_constructions: Colección que contiene todas las construcciones
    // Para preprodición, y trabajar sobre una única construcción, se puede añadir al final de la línea ".filter(_.id_entity == "construction_id:1534_0")"
    all_constructions = constructionDAO.findAll(page, page_size)//.filter(_.id_entity.contains("construction_id:3579"))

    // Para cada construcción de la colección de construcciones, consultamos su histórico de la tabla "aq_cons_const_agg_hour"
    // y se lo establecemos a la construcción.
    all_constructions foreach { construction =>
      Logger.getGlobal.info("OBTENIENDO HISTORICO DE " + construction.id_entity)
      val history = constructionDAO.getHistoryUntilTonightById(construction.id_entity)
      construction.history(history)
    }


    /** FASE DE PREDICCIÓN **/
    // Para cada construcción de la colección de construcciones, realizamos las predicciones tanto de agua como de presión.
    // Las predicciones calculadas se salvan en la Base de Datos.
    all_constructions foreach { construction =>
      try{
      Logger.getGlobal.info("PREDICCIÓN PARA " + construction.id_entity)
      // Lanzamos el wknn para consumo
      val consumption_wknn: Wknn = new Wknn(construction.consumptionSeries(), h, w, d, false)
      // @val consumption_forecast: secuencia de h-valores predichos
      val consumption_forecast: Seq[Float] = consumption_wknn.getPrediction(k)

      // Lanzamos el wknn para presión
      val pressure_wknn: Wknn = new Wknn(construction.pressureSeries(), h, w, d, false)
      // @val pressure_forecast: secuencia de h-valores predichos
      val pressure_forecast: Seq[Float] = pressure_wknn.getPrediction(k)

      // Unimos las predicciones de consumo y predicción en parejas (consumo, presión)
      val forecastList: Seq[(Float, Float)] = consumption_forecast.zip(pressure_forecast)

      // Persistimos la secuencia de predicciones. (La hora de las predicciones se calcula dentro de la función "save_forecastList")
      constructionDAO.saveForecastList(construction.id_entity, forecastList, h)
      } catch {
        case e: Exception => Logger.getGlobal.log(Level.SEVERE, s"Error. No se han completado las predicciones de construction.id_entity=${construction.id_entity}.")
      }
    }
    page = page + 1

    } while (!all_constructions.isEmpty)

    
  }

  /**
    * Parsea las variables de entorno para asegurar que están establecidas (no se verifica que el contenido de las variables sea correcto).
    * Si no se satisfacen las restricciones se lanza una excepción.
    *
    * @throws IllegalArgumentException excepción lanzada por una variable establecida con longitud cero.
    * @throws NullPointerException     excepción lanzada por no estar establecida una variable.
    */
  @throws(classOf[IllegalArgumentException])
  @throws(classOf[NullPointerException])
  def parseEnvVar(): Unit = {
    // Variables tomadas por el sistema:
    url = System.getenv.get("URL")
    username = System.getenv.get("USERNAME")
    password = System.getenv.get("PASSWORD")
    schema = System.getenv.get("SCHEMA")
    predecirSemanas = System.getenv.get("PREDECIRSEMANAS")

    val envVarEmpty: Boolean = url.isEmpty || username.isEmpty || password.isEmpty || schema.isEmpty || predecirSemanas.isEmpty
    if (envVarEmpty) {
      val envVar: String = s"URL=$url,\nUSERNAME=$username,\nPASSWORD=$password,\nSCHEMA=$schema,\nPREDECIRSEMANAS=$predecirSemanas"
      println(s"Your environmental variables are: \n$envVar\n")

      throw new IllegalArgumentException(s"Invalid environmental variables: \n$envVar\n")
    }

    h = h * predecirSemanas.toInt
  }

}
