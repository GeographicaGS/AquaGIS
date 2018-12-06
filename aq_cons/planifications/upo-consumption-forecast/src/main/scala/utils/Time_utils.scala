package utils

import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, LocalTime}

object Time_utils {

  // @val _timeinstantFormat: formato de TimeInstant
  private val _timeinstantFormat: String = "yyyy-MM-dd HH:mm:ss"

  // @val _formatter: objeto formateador de DateTime
  private val _formatter: DateTimeFormatter = DateTimeFormatter.ofPattern(_timeinstantFormat)

  // @val _initTime: fecha y hora a la que se ejecuta el programa. Es privado.
  private val _initTime: LocalDateTime = LocalDateTime.now()


  /** @return devuelve una cadena de texto con la fecha y hora a la que se ejecuta el programa siguiendo
    *         el formato de '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss")
    */
  def initTimeString: String = _initTime.format(_formatter)

  /** @return devuelve la hora (LocalTime) a la que se ejecuta el programa
    */
  def initTimeLocalTime: LocalTime = _initTime.toLocalTime

  /** @return devuelve la fecha y hora del día ejecución del programa a las 00:00
    */
  def todayStartLocalDateTime: LocalDateTime = {
    _initTime.withHour(0).withMinute(0).withSecond(0).withNano(0)
  }

  /** @return devuelve una cadena de texto con la fecha y hora del día ejecución del programa a las 00:00 siguiendo
    *         el formato de '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss")
    */
  def todayStartString: String = {
    todayStartLocalDateTime.format(_formatter)
  }

  /** @return devuelve la fecha y hora del día siguiete a la ejecución del programa a las 00:00
    */
  def tomorrowStartLocalDateTime: LocalDateTime = {
    todayStartLocalDateTime.plusDays(1)
  }

  /** @return devuelve una cadena de texto con la fecha y hora del día siguiete a la ejecución del programa a
    *         las 00:00 siguiendo el formato de '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss")
    */
  def tomorrowStartString: String = {
    tomorrowStartLocalDateTime.format(_formatter)
  }

  /** Convierte una cadena de texto en formato '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss") a tipo Timestamp
    *
    * @return fecha y hora en tipo Timestamp
    */
  def convertStringToTimestamp(timestamp: String): Timestamp = {
    val formatter = new SimpleDateFormat(_timeinstantFormat)
    val date = formatter.parse(timestamp)
    val timeStampDate = new Timestamp(date.getTime)

    timeStampDate
  }

  /** Convierte una fecha y hora en tipo Timestamp a cadena de texto en formato '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss")
    *
    * @return texto con fecha y hora en formato '''_timeinstantFormat''' ("yyyy-MM-dd HH:mm:ss")
    */
  def timestampToString(timestamp: Timestamp): String = {
    new SimpleDateFormat(_timeinstantFormat).format(timestamp)
  }

  def localDateTimeToTimestamp(localDateTime: LocalDateTime): Timestamp = {
    convertStringToTimestamp(localDateTime.format(_formatter))
  }

}
