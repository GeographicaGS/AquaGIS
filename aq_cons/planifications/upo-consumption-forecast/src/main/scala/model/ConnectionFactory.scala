package model

import java.sql.{Connection, DriverManager}


/** Clase Factoría para crear una conexión
  *
  * @param url     : dirección de la Base de Datos
  * @param username: nombre de usuario
  * @param password: contraseña de acceso
  */
case class ConnectionFactory(url: String, username: String, password: String) {

  /** Crea una conexión a la Base de Datos.
    *
    * @return conexión a la Base de Datos
    */

  var connection: Connection = _
  def getConnection: Connection = {
    if (connection==null){
      connection = DriverManager.getConnection(url, username, password)
      connection
    } else connection
  }
}
