package controller

import model.{Tank, TankDAO}
import utils.Time_utils

object Optimized_engine {

  /** Función auxiliar para procesar una instancia de tiempo.
    * Se comprueba en la ventana alquien tiene un precio más bajo, si es posible se retrasa el llenado de depósito.
    * Si no hay mínimo posible, hay que asegurarse de mantener el min_level.
    *
    * @param tank                   objeto Tank que representa el depósito sobre el que se realizan los cálculos.
    * @param t                      timestamp actual.
    * @param c                      consumo estimado en el momento '''t'''.
    * @param p                      precio de la energía en el momento '''t'''.
    * @param capacidadesFuturas_fin objeto auxiliar que representa la previsión del futuro (timestamp, capacidad en m3, precio).
    *
    * @return secuencia de valores, algunos de ellos son útiles para debug.
    */
  def computeRow(tank: Tank, t: String, c: Double, p: Double, capacidadesFuturas_fin: Seq[(String, Double, Double)]): (Seq[(String, Double, Double)], Double, Double, String, String, Int, Double, String, String, Int, Double) = {
    // @val min_level: capacidad minima en m3
    val min_level: Double = tank.min_level * tank.capacity / 100

    // @val max_level: capacidad máxima en m3
    val max_level: Double = tank.max_level * tank.capacity / 100

    // @val m3_fin: capacidad al terminar la hora en m3 si sólo consideramos el consumo
    val m3_fin = capacidadesFuturas_fin.filter(_._1 == t).head._2

    // @val m3_inicio: capacidad al inicio de la hora en m3
    val m3_inicio = m3_fin + c

    // Se estudia la ventana del futuro, buscando un precio más bajo de la energía, siempre que haya algo de agua en el depósito.
    // Si el resultado está vacio, el precio de la energía es mínimo ahora mismo, siendo el momento de llenar el tanque
    val ventana = capacidadesFuturas_fin.filter { case (horaFutura, capacidadFutura, precioFuturo) =>
      (horaFutura > t) && (capacidadFutura >= 0) && (precioFuturo < p)
    }.sortBy(_._3)

    // Calculamos los minutos de llenado
    val minutosBomba: (Int, Int) = if (ventana.nonEmpty) {
      // Si hay un mínimo en el futuro, es mejor no llenar, pero hay que asegurarse el umbral mínimo del depósito
      if (m3_fin < min_level) {
        var timeA = ((min_level - m3_fin) / (tank.pump_flow / 60.0) + 1).toInt
        (timeA, 0)
      } else {
        (0, 0)
      }
    } else {
      // Si ahora es el precio mínimo, llenamos el tanque a dos tiempos, asegurando que termine la hora con el tanque lleno
      val timeA = ((max_level - m3_inicio) / (tank.pump_flow / 60.0)).toInt
      val timeB = ((max_level - m3_fin) / (tank.pump_flow / 60.0)).toInt - timeA
      (timeA, timeB)
    }

    // Ajustamos los minutos a la limitación de una hora.
    val minutosLlenado: (Int, Int) = if (minutosBomba._1 + minutosBomba._2 > 60) {
      (60, 0)
    } else {
      (minutosBomba._1, minutosBomba._2)
    }

    // @val m3_pausa: m3 estimados al terminar el primer tiempo de llenado
    val m3_pausa = m3_inicio + minutosLlenado._1 * (tank.pump_flow / 60.0)

    // @val m3_fin_efectivo: m3 estimados al terminar la hora
    val m3_fin_efectivo = m3_fin + (minutosLlenado._1 + minutosLlenado._2) * (tank.pump_flow / 60.0)


    // Calculamos los dos tiempos de activaciones de la bomba
    val timestamp_iniciar: (String, String) =
      (
        if (minutosLlenado._1 != 0) {
          t
        } else {
          ""
        }
        ,
        if (minutosLlenado._2 != 0) {
          Time_utils.addMinutesToString(t, 60 - minutosLlenado._2)
        } else {
          ""
        }
      )

    // Calculamos los dos tiempos de paradas de la bomba
    val timestamp_detener: (String, String) =
      (
        if (minutosLlenado._1 != 0) {
          Time_utils.addMinutesToString(t, minutosLlenado._1)
        } else {
          ""
        }
        ,
        if (minutosLlenado._2 != 0) {
          Time_utils.addMinutesToString(t, 60)
        } else {
          ""
        }
      )

    // Se devuelven los resultados, algunos de ellos son útiles para debug.
    // Lo primero que se devuelve es la ventana del futuro, actualizada con los llenados planificados
    (
      // Devolvemos una copia actualizada de la lista "capacidadesFuturas_fin", donde se actualiza la capacidad estimada al finalizar cada hora, con los m3 que se han llenado en ésta hora
      capacidadesFuturas_fin.map { case (t2, capacidad_fin, p2) =>
        if (t2 >= t) {
          (t2, capacidad_fin + (minutosLlenado._1 + minutosLlenado._2) * (tank.pump_flow / 60.0), p2)
        } else {
          (t2, capacidad_fin, p2)
        }
      }
      ,
      m3_inicio, m3_fin, timestamp_iniciar._1, timestamp_detener._1, minutosLlenado._1, m3_pausa, timestamp_iniciar._2, timestamp_detener._2, minutosLlenado._2, m3_fin_efectivo
    )
  }

  /** Motor de planificación optimizado.
    *
    * @note para poder optimizar el llenado de las últimas horas del día, se consideran que los precios del día siguiente al que se está planificando se mantendrán.
    *
    * @param tankDAO      conector a la base de datos.
    * @param tank         depósito sobre el que se realiza la planificación.
    * @param energy_price secuencia del precio de la energía durante el día en curso (timestamp, €).
    */
  def apply(tankDAO: TankDAO, tank: Tank, energy_price: Seq[(String, Double)]) = {

    //@val estadoInicial: hora y m3 al inicio de la hora actual
    val estadoInicial: (String, Double) = (tank.currentLevel_m3._1, tank.currentLevel_m3._2)
    val m3_inicio = estadoInicial._2

    // Unimos los consumos estimados con los precios de la energía
    // @val tank.forecastForCurrentDay: Es la lista con las los consumos estimados del depósito "tank". Lista de [hora, consumo]
    // @val energy_price: Es la lista con los precios de la energía. Lista de [hora, precio]
    // @val t_c_p: Lista de [hora, consumo, precio], ordanado por horas
    val t_c_p: Seq[(String, Double, Double)] = tank.forecastForCurrentDay.union(energy_price).groupBy(_._1)
      .map { case (time, consumption_price) =>
        (time, consumption_price.head._2, consumption_price(1)._2)
      }.toSeq.sortBy(_._1)

    // Calculamos la ventana del futuro (de 48h), considerando que el día siguiente se repiten los consumos y los precios.
    val dosDiasFuturos: Array[(String, Double, Double)] = t_c_p.union(t_c_p.takeRight(24)).zipWithIndex.map { case (t_c_p_tuple, index) =>
      if (index >= t_c_p.size) {
        (Time_utils.addMinutesToString(t_c_p_tuple._1, 60 * 24), t_c_p_tuple._2, t_c_p_tuple._3)
      } else {
        (t_c_p_tuple._1, t_c_p_tuple._2, t_c_p_tuple._3)
      }
    }.toArray

    // Recorremos la ventana del futuro para calcular las capacidades estimadas del depósito a cada hora, que almacenamos en "capacidadesFuturas_fin"
    var capacidadesFuturas_fin: Seq[(String, Double, Double)] = dosDiasFuturos.map { case (t, c, p) => (t, m3_inicio, p) }
    for (i <- 0 until capacidadesFuturas_fin.size) {
      for (j <- 0 to i) {
        capacidadesFuturas_fin.updated(i, (capacidadesFuturas_fin(i)._1, capacidadesFuturas_fin(i)._2 - dosDiasFuturos(j)._2, capacidadesFuturas_fin(i)._3))
      }
    }

    // @val tank_opt: Variable donde almacenaremos la planificación
    var tank_opt = Seq.empty[(String, Boolean)]

    // Iteramos cada hora del día de los consumos estimados con los precios de la energía
    t_c_p foreach { case (t, c, p) =>

      // INICIO PROCESAMIENTO DEL REGISTRO
      //
      //
      var res = computeRow(tank, t, c, p, capacidadesFuturas_fin)

      // Actualizamos la ventana del futuro con el consumo producido y los llenados
      capacidadesFuturas_fin = res._1

      // @val times: Array de horas (A_timestamp_iniciar, A_timestamp_detener, B_timestamp_iniciar, B_timestamp_detener)
      var times: Array[String] = Array(res._4, res._5, res._8, res._9)

      // Recorremos las horas calculadas, seleccionando las que nos valen, y pasándolas a la planificación
      for (i <- 0 until times.size) {
        if (times(i) != "") {
          if (i % 2 == 0) {
            if (tank_opt.nonEmpty && tank_opt.last._1 == times(i)) {
              // Limpieza de los apagados y encendendidos a la misma hora
              tank_opt = tank_opt.dropRight(1)
            } else {
              tank_opt = tank_opt :+ (times(i), true)
            }
          } else {
            tank_opt = tank_opt :+ (times(i), false)
          }
        }
      }

      //
      //
      // FIN PROCESAMIENTO DEL REGISTRO
    }

    // Persistencia de la planificación en BD
    println("Guardando planificación optimizada")
    println(tank_opt)
    tankDAO.saveForecast(tank.id, tank_opt, "aq_plan_tank_pump_opt")
  }
}
