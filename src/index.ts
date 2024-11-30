// Vertically scaling using node.js with help of cluster
import express from "express";
import cluster from "cluster";//cluster will tell that howmany process will run on same port number there will be multiple server run using fork
import os from "os";//from the os package we can take the how many core cpu have that can see dynamically in our pc 

const totalCPUs = os.cpus().length;//here calculating the cpu //so we can run upto that much process create//bcz js is single threaded so one process continously run in cpu//

const port = 3000;

//in if case that is not telling the app.get("/")// everything will serve by the else part
if (cluster.isPrimary) {//this parent process//only first time execute//this only true for first time and remainng all process will false this if condition//remaining all process will start from first line
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {//fork the process upto total cpu how much you have cpu in your pc// parent is only telling that how many process have to create upto no. of cpu
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {//exit means if one of the process is exit then fork again // which means suppose you created 8 proceess
    //then one of the process is exited then it will tell that one process create again
    console.log(`worker ${worker.process.pid} died`);// which process is exited that process id print
    console.log("Let's fork another worker!");
    cluster.fork();//again process create if one of the process is exit
  });
} else {//except first remaining all fork process will execute the else part bcz if (cluster.isPrimary)  this will false for them
  const app = express();//express will start 
  console.log(`Worker ${process.pid} started`);//which process forked then that process id will print 

  app.get("/", (req, res) => {// for remaining all of them they will serve this 
    res.send("Hello World!");
  });

  app.get("/api/:n", function (req, res) {// for remaining all of them they will serve this 
    let n = parseInt(req.params.n);
    let count = 0;

    if (n > 5000000000) n = 5000000000;//this is task

    for (let i = 0; i <= n; i++) {
      count += i;
    }

    res.send(`Final count is ${count} ${process.pid}`);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}