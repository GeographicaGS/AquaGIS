package model

/** Clase principal que representa un depósito.
  *
  * @param id         identificador del depósito.
  * @param capacity   capacidad en m3.
  * @param min_level  porcentaje mínimo del nivel de llenado.
  * @param max_level  porcentaje máximo del nivel de llenado.
  * @param pump_flow  caudal en m3/h que la bomba es capaz de dar.
  * @param pump_power potencia en MW que la bomba necesita.
  */
case class Tank(
                 id: String,
                 capacity: Double,
                 min_level: Double,
                 max_level: Double,
                 pump_flow: Double,
                 pump_power: Double
               ) {

  var start_level_m3: (String, Double) = null
  var sectors: Seq[String] = Seq.empty[String]
  var forecastForCurrentDay: Seq[(String, Double)] = Seq.empty[(String, Double)]
  var currentLevel_m3: (String, Double) = null

  /** Establece el valor de la capacidad del depósito al comienzo del día.
    *
    * @param start_level_m3 valor de la capacidad del depósito al comienzo del día (timestamp, m3).
    * @return devuelve el mismo objeto que ha invocado al método.
    */
  def setStart_level_m3(start_level_m3: (String, Double)): Tank = {
    this.start_level_m3 = start_level_m3
    this
  }

  /** Establece la secuencia de los sectores que abastece el depósito.
    *
    * @param sectorsIdList secuencia de identificadores de sectores.
    * @return devuelve el mismo objeto que ha invocado al método.
    */
  def setSectors(sectorsIdList: Seq[String]): Tank = {
    this.sectors = sectorsIdList
    this
  }

  /** Establece la secuencia de consumos esperados a cada hora para el día en curso.
    *
    * @param forecast secuencia de consumos esperados a cada hora (timestamp, m3) para el día en curso.
    * @return devuelve el mismo objeto que ha invocado al método.
    */
  def setForecastForCurrentDay(forecast: Seq[(String, Double)]): Tank = {
    this.forecastForCurrentDay = forecast.map { case (t, c) => (t, c) }
    this
  }

  /** Establece la capacidad actual del depósito.
    *
    * @param currentLevel capacidad actual del depósito (timestamp, m3).
    * @return devuelve el mismo objeto que ha invocado al método.
    */
  def setCurrentLevel_m3(currentLevel: (String, Double)): Tank = {
    this.currentLevel_m3 = currentLevel
    this
  }
}

