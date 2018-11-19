package controller

import model.{Tank, TankDAO}
import utils.Time_utils

object Not_optimized_engine {

  /** Función auxiliar para procesar una instancia de tiempo.
    *
    * @param tank                   objeto Tank que representa el depósito sobre el que se realizan los cálculos.
    * @param t                      timestamp actual.
    * @param c                      consumo estimado en el momento '''t'''.
    * @param p                      precio de la energía en el momento '''t'''.
    * @param m3_inicio capacidad del depósito en el instante t
    * @param todaviaLlenando estado actual de la bomba de llenado
    * @return secuencia de valores, algunos de ellos son útiles para debug.
    */
  def computeRow(tank: Tank, t: String, c: Double, p: Double, m3_inicio: Double, todaviaLlenando: Boolean): (Double, Double, Boolean, Boolean, Int, String, String, Int, Boolean, Double) = {
    // @val min_level: capacidad minima en m3
    val min_level: Double = tank.min_level * tank.capacity / 100

    // @val max_level: capacidad máxima en m3
    val max_level: Double = tank.max_level * tank.capacity / 100

    // @val m3_fin: capacidad al terminar la hora en m3 si sólo consideramos el consumo
    val m3_fin = m3_inicio - c

    // @val thr_fin: true si al terminar la hora se rebasa la capacidad minima si sólo consideramos el consumo
    val thr_fin: Boolean = (m3_fin < min_level)

    // tiempo que tendríamos que llenar para alcanzar "max_level",
    // necesario si se ha rebasado el umbral o no ha terminado un llenado anterior
    val minutosBomba: Int = if (todaviaLlenando || thr_fin) {
      ((max_level - m3_inicio) / (tank.pump_flow / 60.0)).toInt
    } else {
      0
    }

    // Ajustamos los minutos a la limitación de una hora.
    val minutosLlenado: Int = if (minutosBomba > 60) {
      60
    } else {
      minutosBomba
    }

    // true si hay que mantener el llenado hasta la siguiente hora,
    // que será la que se encargará del apagado de la bomba
    val mantenerLlenado: Boolean = (minutosBomba > 60)

    // establecemos la hora de activar el llenado si es necesario
    val timestamp_iniciar: String = if (!todaviaLlenando && minutosLlenado > 0) {
      t
    } else {
      ""
    }

    // establecemos la hora de parar el llenado si es necesario
    val timestamp_detener: String = if (!mantenerLlenado && minutosLlenado > 0) {
      Time_utils.addMinutesToString(t, minutosBomba)
    } else {
      ""
    }

    // capacidad del depósito una vez considerado el consumo y el llenado
    val capacidad_finEfectiva: Double = m3_fin + minutosLlenado * (tank.pump_flow / 60.0)

    // Se devuelven los resultados, algunos de ellos son útiles para debug.
    (m3_inicio, m3_fin, thr_fin, todaviaLlenando, minutosBomba, timestamp_iniciar, timestamp_detener, minutosLlenado, mantenerLlenado, capacidad_finEfectiva)
  }

  /** Motor de planificación no optimizado.
    *
    * @param tankDAO      conector a la base de datos.
    * @param tank         depósito sobre el que se realiza la planificación.
    * @param energy_price secuencia del precio de la energía durante el día en curso (timestamp, €).
    */
  def apply(tankDAO: TankDAO, tank: Tank, energy_price: Seq[(String, Double)]) = {

    //@val estadoInicial: hora y m3 al inicio de la hora actual
    val estadoInicial: (String, Double) = (tank.currentLevel_m3._1, tank.currentLevel_m3._2)
    var m3_inicio: Double = estadoInicial._2

    // Unimos los consumos estimados con los precios de la energía
    // @val t_c_p: Lista de [hora, consumo, precio], ordanado por horas
    val t_c_p: Seq[(String, Double, Double)] = tank.forecastForCurrentDay.union(energy_price).groupBy(_._1)
      .map { case (time, consumption_price) =>
        (time, consumption_price.head._2, consumption_price(1)._2)
      }.toSeq.sortBy(_._1)

    // @val tank_no_opt: Variable donde almacenaremos la planificación
    var tank_no_opt: Seq[(String, Boolean)] = Seq.empty
    var todaviaLlenando: Boolean = false

    // Iteramos cada hora del día de los consumos estimados con los precios de la energía
    t_c_p foreach { case (t, c, p) =>

      // INICIO PROCESAMIENTO DEL REGISTRO
      //
      //
      val registroProcesado = computeRow(tank, t, c, p, m3_inicio, todaviaLlenando)

      // actualizamos los estados para que se utilicen en la siguiente iteración sobre la hora
      todaviaLlenando = registroProcesado._9
      m3_inicio = registroProcesado._10

      // Recorremos las horas calculadas, pasándolas a la planificación
      if (registroProcesado._6 != "") {
        tank_no_opt = tank_no_opt :+ (registroProcesado._6, true)
      }
      if (registroProcesado._7 != "") {
        tank_no_opt = tank_no_opt :+ (registroProcesado._7, false)
      }
      //
      //
      // FIN PROCESAMIENTO DEL REGISTRO
    }

    // nos aseguramos que al terminar el día se detenga el llenado si permanece activo, añadiendo una acción más a lista de planificaciones "aq_plan_tank_pump_no_opt"
    // conseguimos que cada día, la planificación comience sobre parado
    if (tank_no_opt.nonEmpty && tank_no_opt.last._2 != false) {
      tank_no_opt = tank_no_opt :+ (Time_utils.addMinutesToString(tank_no_opt.last._1, 60), false)
    }

    // Persistencia de la planificación en BD
    tankDAO.saveForecast(tank.id_entity, tank_no_opt, table = "aq_plan_tank_pump_no_opt")
  }
}
