lazy val root = (project in file(".")).
  settings(
    name := "ahorro_fase3",
    version := "0.1",
    scalaVersion := "2.12.7",
    mainClass in Compile := Some("Main")
  )

libraryDependencies ++= Seq(
  "postgresql" % "postgresql" % "latest.release"
)
