package utils

import java.sql.Timestamp
import java.text.SimpleDateFormat
import java.util.Calendar

object Time_utils {

  var startTimestamp = ""
  var currentTimestamp = ""
  var endTimestamp = ""


  /**
    * Dado un timestamp actual, actualiza las variables de timestamp de inicio y fin del día.
    *
    * @param str_time texto que en formato "yyyy-MM-dd HH:mm:ss" que representa el timestamp actual. Dado un
    *                 timestamp actual,
    *                 se recalcula la hora de inicio del día (00:00:00), y la hora final (23:00:00).
    *
    * @return no devuelve nada.
    */
  def syncTimesTo(str_time: String) = {
    this.currentTimestamp = str_time
    var auxTimestamp: Timestamp = convertStringToTimestamp(currentTimestamp)
    val c = Calendar.getInstance
    c.setTimeInMillis(convertStringToTimestamp(currentTimestamp).getTime)
    c.set(Calendar.HOUR_OF_DAY, 0)
    c.set(Calendar.MINUTE, 0)
    c.set(Calendar.SECOND, 0)
    c.set(Calendar.MILLISECOND, 0)
    auxTimestamp.setTime(c.getTimeInMillis)

    this.startTimestamp = timestampToString(auxTimestamp)
    this.endTimestamp = addMinutesToString(startTimestamp, 60 * 23)
  }

  /**
    * Dado un timestamp actual, actualiza las variables de timestamp de inicio y fin del día.
    *
    * @param timestamp texto que en formato "yyyy-MM-dd HH:mm:ss" que representa un timestamp, y queremos convertirlo
    *                  a la clase java.sql.Timestamp
    *
    * @return devuelve la fecha y hora en un objeto de la clase java.sql.Timestamp.
    */
  def convertStringToTimestamp(timestamp: String): Timestamp = {
    val formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
    val date = formatter.parse(timestamp)
    val timeStampDate = new Timestamp(date.getTime())

    timeStampDate
  }

  /**
    * Dado una fecha y hora en java.sql.Timestamp se convierte a texto según el formato "yyyy-MM-dd HH:mm:ss".
    *
    * @param timestamp objeto de la clase java.sql.Timestamp, cuya fecha y hora queremos pasar a texto.
    *
    * @return devuelve la fecha y hora en texto según el formato "yyyy-MM-dd HH:mm:ss".
    */
  def timestampToString(timestamp: Timestamp): String = {
    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(timestamp)
  }

  def addMinutesToString(str_time: String, minutes: Int): String = {
    val formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
    val date = formatter.parse(str_time)
    timestampToString(new Timestamp(date.getTime() + minutes * 60 * 1000))
  }

}
