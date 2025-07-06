// let userHandle = "chetanpdf"
const table = document.getElementById("table");
const error = document.getElementById("error");
let users = [];

let userData = [];

window.addEventListener("resize", function () {
  var canvas = document.getElementById("myChart");
  canvas.style.width = "100%";
  canvas.style.height = "auto";
});

const fetchUser = () => {
  let userHandle = document.getElementById("forcesUsername").value;
  const ur = `https://codeforces.com/api/user.status?handle=${userHandle}`;
  const ur2 = `https://codeforces.com/api/user.info?handles=${userHandle}`;
  const ur3 = `https://codeforces.com/api/contest.list?gym=true&handle=${userHandle}`;
  const tr = document.createElement("tr");
  let c = 0;
  let score = 0;
  let xValues, yValues;
  let userObj = new Object();
  let tagObj = new Object();
  let userTags = [];
  let userTagsObjs = [];

  //solved count
  setTimeout(() => {
    fetch(ur)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        res = data.result;
        console.log(res);
        let tagz = [];
        res.forEach((element) => {
          if (element.verdict === "OK") {
            tagz.push(element.problem.tags);
          }
        });
        let tagzCount = {};

        tagz.forEach((tag) => {
          tag.forEach((t) => {
            if (tagzCount.hasOwnProperty(t)) {
              tagzCount[t]++;
            } else {
              tagzCount[t] = 1;
            }
          });
        });
        console.log(tagzCount);
        // Prepare data for pie chart
        const labels = Object.keys(tagzCount);
        const datas = Object.values(tagzCount);

        // Create pie chart
        const ctx = document.getElementById("tagPieChart").getContext("2d");
        const tagPieChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Tag Count",
                data: datas,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                  "rgba(153, 102, 255, 0.6)",
                  "rgba(255, 159, 64, 0.6)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: "Tag Usage Pie Chart",
              },
            },
          },
        });
        let problemArray = data.result;
        console.log(userTags);
        if (data.status === "FAILED") {
          error.innerText = `User with handle ${userHandle} not found!!`;
        } else {
          error.innerText = ``;
        }
        const problems = data.result.filter((sub) => sub.verdict === "OK");
        return problems;
      })
      .then((problems) => {
        if (!users.includes(userHandle)) {
          const td1 = document.createElement("td");
          td1.innerHTML = userHandle;

          userObj.name = userHandle;
          const td2 = document.createElement("td");
          if (problems.length < 62) {
            td2.style.color = "red";
            c++;
          }
          score = 10 * problems.length;
          td2.innerHTML = problems.length;
          userObj.solved = problems.length;
          tr.appendChild(td1);
          tr.appendChild(td2);
          table.appendChild(tr);
        }
        users.push(userHandle);
      })
      .catch((e) => {
        console.log(e);
      });
  }, 1000);

  //ratings
  setTimeout(() => {
    fetch(ur2)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .then((details) => {
        console.log(details);
        // if (!users.includes(userHandle)) {

        const td3 = document.createElement("td");
        if (details.result[0].maxRating < 800) {
          td3.style.color = "red";
          c++;
        }
        td3.innerText = details.result[0].maxRating;
        userObj.maxRating = details.result[0].maxRating;

        const td4 = document.createElement("td");
        if (details.result[0].rating < 800) {
          td4.style.color = "red";
          c++;
        }
        td4.innerText = details.result[0].rating;
        userObj.currentRating = details.result[0].rating;
        const td5 = document.createElement("td");
        td5.innerText = score;
        userObj.score = score;
        const td6 = document.createElement("td");
        td6.innerText = c;
        userObj.redFlags = c;
        userData.push(userObj);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        table.appendChild(tr);

        xValues = userData.map((elem) => {
          return elem.name;
        });
        yValues = userData.map((elem) => {
          return elem.currentRating;
        });
        new Chart("myChart", {
          type: "line",
          data: {
            labels: xValues,
            datasets: [
              {
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues,
              },
            ],
          },
          options: {
            legend: { display: false },
            scales: {
              yAxes: [{ rating: { min: 300, max: 10000 } }],
            },
          },
        });

        // }
      })
      .catch((e) => {
        console.log(e);
      });
    console.log(userTagsObjs);
  }, 4000);
};
