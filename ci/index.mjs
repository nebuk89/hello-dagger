import { connect } from "@dagger.io/dagger"


connect(async (client) => {

    // mount source code into a container 
  const source = client.container()
    .from("node:16-slim")
    .withDirectory('/src', client.host().directory('.'),
    { exclude: ["node_modules/", "ci/"] })

// sets our current working directory to source and installs dependencies
  const runner = source
    .withWorkdir("/src")
    .withExec(["npm", "install"])

  // run application tests
  const test = runner
    .withExec(["npm", "test", "--", "--watchAll=false"])

  // first stage (testing multi stage) build ap 
  const buildDir = test
    .withExec(["npm", "run", "build"])
    .directory("./build")

  // second stage
  // use an nginx:alpine container
  // copy the build/ directory from the first stage
  // publish the resulting container to a registry
  const imageRef = await client.container()
    .from("nginx:1.23-alpine")
    .withDirectory('/usr/share/nginx/html', buildDir)
    .publish('bengotch/hellodagger-' + Math.floor(Math.random() * 10000000))
   console.log(`Published image to: ${imageRef}`)



}, { LogOutput: process.stdout })