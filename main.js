// let userHandle = "chetanpdf"
const table = document.getElementById("table")
const error = document.getElementById("error")
let users = []

let userData = []

window.addEventListener('resize', function() {
  var canvas = document.getElementById('myChart');
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
});



const fetchUser = () => {
  console.log("btn clicked")
  let userHandle = document.getElementById("forcesUsername").value
  console.log(userHandle);
  const ur = `https://codeforces.com/api/user.status?handle=${userHandle}`
  const ur2 = `https://codeforces.com/api/user.info?handles=${userHandle}`

  const tr = document.createElement("tr")
  let c=0;
  let score=0;
  let xValues, yValues
  let userObj = new Object()

  //solved count
  setTimeout(()=>{
  fetch(ur).then((response) => {
    console.log("i am ur request", response)
    return response.json()
  }).then((data) => {
    console.log(data)
    console.log(data.status);
    console.log(data.comment);
    if(data.status === 'FAILED'){
      error.innerText = `User with handle ${userHandle} not found!!`
    }else{
      error.innerText = ``

    }
    const problems = data.result.filter(sub => sub.verdict === "OK")
    return problems

  }).then((problems) => {
    console.log(problems.length)
    if (!users.includes(userHandle)) {
      const td1 = document.createElement("td")
      td1.innerHTML = userHandle
      
      userObj.name = userHandle
      const td2 = document.createElement("td")
      if(problems.length<62){
        td2.style.color = "red"
        c++
      }
      score = 10*(problems.length)
      td2.innerHTML = problems.length
      userObj.solved = problems.length
      tr.appendChild(td1)
      tr.appendChild(td2)
      table.appendChild(tr)
    }
    users.push(userHandle)

  }).catch((e) => {
    console.log(e)
  })}, 1000)


  //ratings
  setTimeout(()=>{
    fetch(ur2)
    .then((response) => {
      console.log("this is fetch ur2 response", response)
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .then((details) => {
      const td3 = document.createElement("td")
      if(details.result[0].maxRating < 800){
        td3.style.color= "red"
        c++
      }
      td3.innerText = details.result[0].maxRating
      userObj.maxRating = details.result[0].maxRating

      const td4 = document.createElement("td")
      if(details.result[0].rating < 800){
        td4.style.color= "red"
        c++;
      }
      td4.innerText = details.result[0].rating
      userObj.currentRating = details.result[0].rating

      const td5 = document.createElement("td")
      td5.innerText = score
      userObj.score = score

      const td6 = document.createElement("td")
      td6.innerText=c
      userObj.redFlags = c

      userData.push(userObj)
      console.log(userData)


      tr.appendChild(td3)
      tr.appendChild(td4)
      tr.appendChild(td5)
      tr.appendChild(td6)
      table.appendChild(tr)

      xValues = userData.map((elem)=>{
        return elem.name
      })
      yValues = userData.map((elem)=>{
        return elem.currentRating
      })
      console.log("this is xvalue",xValues)
      console.log("this is yvalue",yValues)

      new Chart("myChart", {
        type: "line",
        data: {
          labels: xValues,
          datasets: [{
            fill: false,
            lineTension: 0,
            backgroundColor: "rgba(0,0,255,1.0)",
            borderColor: "rgba(0,0,255,0.1)",
            data: yValues
          }]
        },
        options: {
          legend: {display: false},
          scales: {
            yAxes: [{rating: {min: 300, max:10000}}],
          }
        }
      });
    })
    .catch((e) => {
      console.log(e);
    }); 
  }, 4000)
}