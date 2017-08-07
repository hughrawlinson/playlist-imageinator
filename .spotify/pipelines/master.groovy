@Grab(group='com.spotify', module='pipeline-conventions', version='1.0.5', changing = true)
import static com.spotify.pipeline.Conventions.pipeline

pipeline(this) {
  group(name: 'Build & Test') {
    shell.run(cmd: './.spotify/scripts/build.sh')

    jenkinsPipeline.inJob {
      logRotator (-1, -1, -1, 5) // keep only last 5 artifacts
    }
  }
}

