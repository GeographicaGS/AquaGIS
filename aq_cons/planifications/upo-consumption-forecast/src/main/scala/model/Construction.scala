package model

import java.io.Serializable
import java.sql.Timestamp

/** Clase que representa una construcción
  *
  * @param id_entity: identificador de la construcción
  * @param refsector: sector al que pertenece la construcción
  * @param refplot  : parcela a la que pertenece la construcción
  * @param usage    : tipo de uso de la construcción
  */
case class Construction(id_entity: String, refsector: String, refplot: String, usage: String) extends Serializable {

  // @var history: historial de registros de la tabla '''aq_cons_const_agg_hour'''. (TimeInstant, consumption, forecast, pressure_forecast, pressure_agg)
  var history: Seq[(Timestamp, Float, Float, Float, Float)] = _

  /** Devuelve la secuencia de datos históricos
    *
    * @return secuencia de datos históricos (TimeInstant, consumption, forecast, pressure_forecast, pressure_agg)
    */
  def history(history: Seq[(Timestamp, Float, Float, Float, Float)]): Unit = {
    this.history = history
  }

  /** Procesa el historial de datos históricos relativo a consumo, considerando los valores predichos cuando faltan datos en los reales
    *
    * @return secuencia de valores
    */
  def consumptionSeries(): Seq[Float] = {
    history.map { case (_, consumption, forecast, _, _) =>
      if (consumption != 0.0) consumption else forecast
    }
  }

  /** Procesa el historial de datos históricos relativo a presión, considerando los valores predichos cuando faltan datos en los reales
    *
    * @return secuencia de valores
    */
  def pressureSeries(): Seq[Float] = {
    history.map { case (_, _, _, pressure_forecast, pressure_agg) =>
      if (pressure_agg != 0.0) {
        pressure_agg
      } else {
        pressure_forecast
      }
    }
  }

  /** Redefinición del método toString.
    *
    * @return cadena de texto con "id_entity, refsector, refplot, usage" de la construcción
    */
  override def toString: String = {
    s"$id_entity, $refsector, $refplot, $usage"
  }


}
