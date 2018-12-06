package wknn

/** Algoritmo basado en WKNN para predecir los siguientes h-valores de una serie temporal.
  * Dada una serie temporal, se calcula una matriz de patrones de comportamientos, con la que se calcula la predicción.
  * Además, es posible establecer esta matriz por parámetros, que debe ser calculada previamente.
  *
  * @param series     : Serie temporal de valores reales
  * @param h          : número de valores siguientes a predecir
  * @param w          : tamaño de los patrones de comportamiento
  * @param d          : distancia entre los patrones de comportamiento
  * @param testMode   : modo de ejecución ['''true''' para el modo test]. Este modo aparta los últimos h-valores
  *                   de '''series''' para calcular el error de las predicciones.
  * @param matrixToUse: matriz de patrones de comportamiento. Opcional
  *
  * @throws Exception: si no se ha seleccionado el modo test y se intenta acceder a una función que lo necesite.
  *
  */
class Wknn(series: Seq[Float], h: Int, w: Int, d: Int, testMode: Boolean, matrixToUse: Option[Set[(Seq[Float], Seq[Float])]] = None) {

  // @val h_test: secuencia de los últimos h-valores de '''series''' para calcular el error de las predicciones. Sólo aplicable en el modo test.
  val h_test: Option[Seq[Float]] = if (testMode) {
    Some.apply(series.takeRight(h))
  } else {
    None
  }

  // @val series_test: secuencia de valores de la serie temporal, habiendo quitado los últimos h-valores para calcular el error de las predicciones.
  // Sólo aplicable en el modo test.
  private val series_test: Option[Seq[Float]] = if (testMode) {
    Some.apply(series.dropRight(h))
  } else {
    None
  }

  // Se lanza el algoritmo WKNN con los parámetros que correspondan, en función de si se ha activado el modo test, y si hay una matriz preprocesada o no.
  // @val model: modelo resultante de aplicar el algoritmo WKNN.
  private val model = (testMode, matrixToUse) match {
    case (false, None) => new WknnModel(series, h, w, d)
    case (false, _) => new WknnModel(series, h, w, d, Some.apply(matrixToUse.get))
    case (true, None) => new WknnModel(series_test.get, h, w, d)
    case (true, _) => new WknnModel(series_test.get, h, w, d, Some.apply(matrixToUse.get))

    case _ => throw new Exception("ERROR INESPERADO AL GENERAR EL MODELO DE WKNN")
  }

  /** @return devuelve el modelo resultante de aplicar el algoritmo WKNN.
    */
  def getModel: WknnModel = {
    model
  }

  /** Calcular las predicciones en base al modelo calculado, dado cierto '''k'''-patrones a combinar.
    *
    * @param k: número de patrones a combinar
    *
    * @return devuelve el modelo resultante de aplicar el algoritmo WKNN.
    */
  def getPrediction(k: Int): Seq[Float] = getModel.getPrediction(k)

  /** Imprime por pantalla los errores calculados en formato (alias,h,w,d,k,E,ME,MAE,MRE). Sólo aplicable en el modo test.
    *
    * @param k    : número de patrones a combinar
    * @param alias: alias de los resultados. Útil para debug.
    *
    * @throws Exception: si no se ha seleccionado el modo test
    */
  def printErrors(k: Int, alias: String): Unit = {
    if (testMode) {
      val r_p: Seq[(Float, Float)] = h_test.get.zip(model.getPrediction(k))

      val E = r_p.map { case (r, p) => r - p }.sum
      val ME = r_p.map { case (r, p) => r - p }.sum / h
      val MAE = r_p.map { case (r, p) => math.abs(r - p) }.sum / h
      val MRE = r_p.map { case (r, p) => math.abs(r - p) / r }.sum / h

      println("alias,h,w,d,k,E,ME,MAE,MRE")
      println(s"$alias,$h,$w,$d,$k,$E,$ME,$MAE,$MRE")

    } else {
      throw new Exception("NO SE HA SELECCIONADO EL MODO TEST")
    }
  }

  /** Imprime por pantalla las parejas de valores reales y predichos, dado cierto '''k'''-patrones a combinar.
    *
    * @param k: número de patrones a combinar
    *
    * @throws Exception: si no se ha seleccionado el modo test
    */
  def valuesAndPreds(k: Int): Unit = {
    if (testMode) {
      val r_p = h_test.zip(model.getPrediction(k))

      println("actual,predicted")
      r_p foreach { x => println(s"${x._1},${x._2}") }

    } else {
      throw new Exception("NO SE HA SELECIONADO EL MODO TEST")
    }
  }

}
