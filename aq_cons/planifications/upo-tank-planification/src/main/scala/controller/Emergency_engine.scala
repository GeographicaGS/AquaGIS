package controller

import model.{Tank, TankDAO}
import utils.Time_utils

object Emergency_engine {

  /** Motor de mantenimiento y/o emergencia.
    *
    * @note Se comprueba la capacidad actual del depósito para activar el llenado de emergencia si es necesario.
    *       Además, debe gestionar la parada de la bomba cuando el llenado se completa.
    *
    * @param tankDAO      conector a la base de datos.
    * @param tank         depósito sobre el que se realiza la planificación.
    */
  def apply(tankDAO: TankDAO, tank: Tank) = {

    val min_m3: Double = tank.min_level * tank.capacity / 100
    val max_m3: Double = tank.max_level * tank.capacity / 100

    // Consultamos la BD para obtener las emergencias del día en curso
    val pumpEmergencies = tankDAO.loadPumpEmergenciesUntilCurrentTimeByTankId(tank.id_entity)
    val lastEmergency: (String, Boolean) = if (pumpEmergencies.nonEmpty) {
      pumpEmergencies.last
    } else {
      ("", false)
    }


    // Si no terminó de llenarse la última emergencia, se continua con el llenado hasta max_m3.
    // Si el llenado tarda menos de 60min se registra la acción de detener la bomba. Si no, se gestionará el apagado en la siguiente hora.
    if (lastEmergency._1 != "") {
      if (lastEmergency._2 != false) {
        val minutosBomba = ((max_m3 - tank.currentLevel_m3._2) / (tank.pump_flow / 60.0)).toInt
        if (minutosBomba <= 60) {
          tankDAO.saveEmergency(tank.id_entity, Time_utils.addMinutesToString(Time_utils.currentTimestamp, minutosBomba), activated = false)
        }
      }
    }

    // De todas formas, se comprueba si el nivel actual ha rebasado el umbral mínimo, implicando una nueva emergencia para llenar hasta max_m3.
    // Si el llenado tarda menos de 60min se registra la acción de detener la bomba. Si no, se gestionará el apagado en la siguiente hora.
    if (tank.currentLevel_m3._2 < min_m3) {
      tankDAO.saveEmergency(tank.id_entity, Time_utils.currentTimestamp, activated = true)
      val minutosBomba = ((max_m3 - tank.currentLevel_m3._2) / (tank.pump_flow / 60.0)).toInt
      if (minutosBomba <= 60) {
        tankDAO.saveEmergency(tank.id_entity, Time_utils.addMinutesToString(Time_utils.currentTimestamp, minutosBomba), activated = false)
      }
    }
  }
}
