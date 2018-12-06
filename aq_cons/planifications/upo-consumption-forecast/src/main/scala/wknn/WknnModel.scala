package wknn

import scala.math.{pow, sqrt}

/** Clase que representa lo que sería el modelo del algoritmo wknn
  *
  * @param series     : Serie temporal de valores reales
  * @param h          : número de valores siguientes a predecir
  * @param w          : tamaño de los patrones de comportamiento
  * @param d          : distancia entre los patrones de comportamiento
  * @param matrixToUse: matriz de patrones de comportamiento. Opcional
  */
class WknnModel(series: Seq[Float], h: Int, w: Int, d: Int, matrixToUse: Option[Set[(Seq[Float], Seq[Float])]] = None) {

  // val w_pattern: Secuencia de los últimos w-valores de la serie temporal, que es el patrón de la serie objetivo.
  // Sus siguientes h-valores son los que queremos predecir.
  val w_pattern: Seq[Float] = series.takeRight(w)

  // @val matrix: Conjunto de parejas (w-valores,h-valores)
  val matrix: Set[(Seq[Float], Seq[Float])] = if (matrixToUse.isEmpty) {
    computeMatrix()
  } else {
    matrixToUse.get
  }

  // @val matrixOrderedByDistances: se añade una columna a "matrix" con las distancias euclídeas de cada w-valores a el patrón objetivo.
  // Los registros están ordenados ascendentemente por la distancia.
  val matrixOrderedByDistances: Seq[(Seq[Float], Seq[Float], Float)] = computeMatrixOrderedByDistances()

  // @val matrixOrderedByDistances_weighted: se añaden dos nuevas columnas, h-values ponderados, y el peso de la ponderación
  val matrixOrderedByDistances_weighted: Seq[(Seq[Float], Seq[Float], Float, Seq[Float], Float)] = computeMatrixOrderedByDistancesWeighted()


  /** Calcular las predicciones en base a "matrixOrderedByDistances_weighted", dado cierto '''k'''-patrones a combinar.
    *
    * @param k: número de patrones a combinar
    *
    * @return devuelve la secuencia de h-valores predichos
    */
  def getPrediction(k: Int): Seq[Float] = {
    // @val k_selected: se seleccionan los k-registros que más se parecen al patrón objetivo
    val k_selected = matrixOrderedByDistances_weighted.take(k)

    // Recorremos los h-values ponderados de cada registro seleccionado, combinando k predicciones.
    // @val sumOf_k_selected_h_seq_weighted: Secuencia de h-valores, con las sumas por columna de las predicciones de los k-registros seleccionados.
    val sumOf_k_selected_h_seq_weighted: Seq[Float] = for {i <- 0 until h} yield {
      k_selected.map { case (_, _, _, h_seq_weighted, _) => h_seq_weighted.apply(i) }.sum
    }

    // @val sumOf_k_selected_weights: Suma de los pesos de los k-registros seleccionados.
    val sumOf_k_selected_weights: Float = k_selected.map { case (_, _, _, _, weight) => weight }.sum

    // Por último, se ponderan las predicciones con la suma de los pesos
    // @val prediction: secuencia de h-valores predichos
    val prediction: Seq[Float] = sumOf_k_selected_h_seq_weighted.map(_ / sumOf_k_selected_weights)

    prediction
  }


  /** Procesamiento de la serie temporal para obtener una matriz de ventanas de comportamientos y sus respectivos h-valores siguientes
    *
    * @return conjunto de de ventanas de comportamientos y sus respectivos h-valores siguientes (w-valores, h-valores)
    *
    * @throws Exception excepción lanzada si serie temporal no ha sido truncada correctamente.
    */
  private def computeMatrix(): Set[(Seq[Float], Seq[Float])] = {
    // @val series_truncated: Serie temporal truncada por el principio, desechando los valores sobrantes.
    val series_truncated: Seq[Float] = series.drop((series.size - h) % d)

    // @val matrix: matriz de ventanas de comportamientos y sus respectivos h-valores siguientes.
    val matrix: Set[(Seq[Float], Seq[Float])] = series_truncated.sliding(w + h, d).toSet[Seq[Float]].map(_.splitAt(w))

    // Nos aseguramos que el truncado de la serie temporal ha sido correcto.
    // Todas las filas de la matriz deben tener exactamente w-valores y h-valores en cada columna.
    val assertRowSizes = matrix.forall { case (w_seq, h_seq) => w_seq.lengthCompare(w) == 0 && h_seq.lengthCompare(h) == 0 }

    if (!assertRowSizes) {
      throw new Exception(s"La serie temporal (size = ${series.size} truncada a size = ${series_truncated.size}) no ha sido truncada correctamente, por lo que la matriz de (w,h) no tiene todas las ventanas del mismo tamaño")
    }

    matrix
  }

  /** Se añade una columna a '''matrix''' con las distancias euclídeas de cada w-valores a el patrón objetivo.
    * Además, se ordena ascendentemente por las distancias.
    *
    * @return matriz ordenada por las distancias euclideas al patrón de comportamiento objetivo.
    *         Los registros tienen la forma (w-valores, h-valores, distancia)
    */
  private def computeMatrixOrderedByDistances(): Seq[(Seq[Float], Seq[Float], Float)] = {
    matrix.map { case (w_seq, h_seq) => (w_seq, h_seq, euclideanDistance(w_seq, w_pattern)) }.toSeq.sortBy(_._3).filterNot(_._3 == 0.0)
  }

  /** se añaden dos nuevas columnas a '''matrixOrderedByDistances''', h-values ponderados, y el peso de la ponderación
    *
    * @return matriz ordenada por las distancias euclideas al patrón de comportamiento objetivo.
    *         Los registros tienen la forma (w-valores, h-valores, distancia, h-valores ponderados, peso)
    */
  private def computeMatrixOrderedByDistancesWeighted(): Seq[(Seq[Float], Seq[Float], Float, Seq[Float], Float)] = {

    // Nueva matrix resultante de recorrer cada registro de "matrixOrderedByDistances", actuando como sigue a continuación:
    val matrixOrderedByDistances_weighted: Seq[(Seq[Float], Seq[Float], Float, Seq[Float], Float)] =
      matrixOrderedByDistances.map { case (w_seq, h_seq, euclideanDistance) =>

        // @val weight: peso de ponderación
        val weight: Float = 1 / (euclideanDistance * euclideanDistance)

        // @val h_seq_weighted: secuencia de h-valores ponderados
        val h_seq_weighted: Seq[Float] = h_seq.map(_ * weight)

        // Se revuelven los registros, incluyendo las 2 nuevas columnas
        (w_seq, h_seq, euclideanDistance, h_seq_weighted, weight)
      }

    // Se devuelve la matriz resultante
    matrixOrderedByDistances_weighted
  }

  /** Función auxiliar que calcula la distancia euclídea entre dos secuencias de valoras
    *
    * @param seq_1: primera secuencia
    * @param seq_2: segunda recuencia
    *
    * @return el valor de la distancia euclídea
    */
  private def euclideanDistance(seq_1: Seq[Float], seq_2: Seq[Float]): Float = {
    val sum = seq_1.zip(seq_2).map { case (a, b) => pow(a - b, 2) }.sum
    sqrt(sum).toFloat
  }
}
