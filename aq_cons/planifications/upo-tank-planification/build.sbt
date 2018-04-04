lazy val root = (project in file(".")).
  settings(
    name := "AquaSIG_fase2_v2",
    version := "0.1",
    scalaVersion := "2.12.4",
    mainClass in Compile := Some("Main")
  )

libraryDependencies ++= Seq(
  "postgresql" % "postgresql" % "latest.release"
)
