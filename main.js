let users = [];
let userData = [];
let userTagData = new Map(); // Store tag data for each user
let ratingChart = null; // Store reference to the rating chart
const table = document.getElementById("table");
const error = document.getElementById("error");
const loading = document.getElementById("loading");
const pieChartsContainer = document.getElementById("pieChartsContainer");
let userMaxRating = 0
window.addEventListener("resize", function () {
  var canvas = document.getElementById("myChart");
  if (canvas) {
    canvas.style.width = "100%";
    canvas.style.height = "auto";
  }
});

const createPieChart = (userHandle, tagzCount, unsolvedUrls, unsolvedNames) => {
  const labels = Object.keys(tagzCount);
  const datas = Object.values(tagzCount);

  if (labels.length > 0) {
    // Create a new card for this user's pie chart
    const pieChartCard = document.createElement("div");
    pieChartCard.className = "card";
    pieChartCard.innerHTML = `
                    <h3 class="card-title">${userHandle} - Problem Tags</h3>
                    <div class="pie-chart-container">
                        <canvas id="tagPieChart_${userHandle}"></canvas>
                    </div>
                    <div class="unsolved-section">
                        <h4 class="unsolved-title">Practice what you left 🥺</h4>
                        <div class="unsolved-problems" id="unsolved_${userHandle}">
                            ${
                              unsolvedUrls.length > 0
                                ? unsolvedUrls
                                    .slice(0, 10)
                                    .map(
                                      (url, index) => `
                                <a href="${url}" target="_blank" class="unsolved-link">
                                  ${
                                    unsolvedNames[index] ||
                                    url.split("/").pop().replace("/", "")
                                  }
                                </a>
                              `
                                    )
                                    .join("")
                                : '<p class="no-unsolved">Great! No unsolved problems found 🎉</p>'
                            }
                            ${
                              unsolvedUrls.length > 10
                                ? `<p class="more-problems">... and ${
                                    unsolvedUrls.length - 10
                                  } more problems</p>`
                                : ""
                            }
                        </div>
                    </div>
                `;

    pieChartsContainer.appendChild(pieChartCard);

    // Create the pie chart
    const ctx = document
      .getElementById(`tagPieChart_${userHandle}`)
      .getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Problems",
            data: datas,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#FF6384",
              "#C9CBCF",
              "#4BC0C0",
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#FF6384",
              "#C9CBCF",
              "#4BC0C0",
              "#FF6384",
              "#36A2EB",
            ].slice(0, labels.length),
            borderColor: "#0a0a0a",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white",
              font: {
                size: 10,
              },
            },
          },
        },
      },
    });
  }
};

const fetchUser = () => {
  let userHandle = document.getElementById("forcesUsername").value.trim();

  if (!userHandle) {
    error.innerHTML = "Please enter a username";
    return;
  }

  if (users.includes(userHandle)) {
    error.innerHTML = `User "${userHandle}" already added`;
    return;
  }

  loading.classList.add("active");
  error.innerHTML = "";

  const ur = `https://codeforces.com/api/user.status?handle=${userHandle}`;
  const ur2 = `https://codeforces.com/api/user.info?handles=${userHandle}`;

  let userObj = {};
  let c = 0;
  let score = 0;

  // Fetch user submissions
  setTimeout(() => {
    fetch(ur)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === "FAILED") {
          error.innerHTML = `User "${userHandle}" not found`;
          loading.classList.remove("active");
          return;
        }

        const res = data.result;
        let tagz = [];
        let unsolvedUrls = [];
        let unsolvedNames = [];
        let solvedProblems = new Set();

        // First pass: collect all solved problems
        res.forEach((element) => {
          if (element.verdict === "OK") {
            tagz.push(element.problem.tags);
            const problemKey =
              element.problem.contestId + "/" + element.problem.index;
            solvedProblems.add(problemKey);
          }
        });

        // Second pass: collect unsolved problems (only if not already solved)
        res.forEach((element) => {
          const problemKey =
            element.problem.contestId + "/" + element.problem.index;
          const problemUrl =
            "https://codeforces.com/problemset/problem/" + problemKey;

          if (
            !solvedProblems.has(problemKey) && // Not solved
            (element.verdict === "SKIPPED" ||
              element.verdict === "WRONG_ANSWER") &&
            !unsolvedUrls.includes(problemUrl) && // Not already in unsolved list
            !unsolvedNames.includes(element.problem.name)
          ) {
            unsolvedUrls.push(problemUrl);
            unsolvedNames.push(element.problem.name);
          }
        });

        // Store unsolved URLs for this user
        userObj.unsolvedUrls = unsolvedUrls;
        userObj.unsolvedNames = unsolvedNames;
        let tagzCount = {};
        tagz.forEach((tag) => {
          tag.forEach((t) => {
            tagzCount[t] = (tagzCount[t] || 0) + 1;
          });
        });

        // Store tag data for this user
        userTagData.set(userHandle, tagzCount);

        // Create individual pie chart for this user
        createPieChart(userHandle, tagzCount, unsolvedUrls, unsolvedNames);

        const problems = data.result.filter((sub) => sub.verdict === "OK");
        userObj.name = userHandle;
        userObj.solved = problems.length;
        score = 10 * problems.length;

        if (problems.length < 62) {
          c++;
        }

        return problems;
      })
      .catch((e) => {
        console.log(e);
        error.innerHTML = "Error fetching user data";
        loading.classList.remove("active");
      });
  }, 1000);

  // Fetch user info
  setTimeout(() => {
    fetch(ur2)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === "FAILED") {
          return;
        }

        const userInfo = data.result[0];
        userObj.maxRating = userInfo.maxRating || 0;
        userObj.currentRating = userInfo.rating || 0;
        userObj.score = score;
        if(userObj.maxRating>userMaxRating) userMaxRating = userObj.maxRating
        if (userInfo.maxRating < 800) c++;
        if (userInfo.rating < 800) c++;

        userObj.redFlags = c;

        // Add to userData if not already present
        if (!users.includes(userHandle)) {
          users.push(userHandle);
          userData.push(userObj);

          // Add table row
          const tbody = table.querySelector("tbody");
          const tr = document.createElement("tr");

          tr.innerHTML = `
                                <td>${userHandle}</td>
                                <td class="${
                                  userObj.solved < 62 ? "red-flag" : ""
                                }">${userObj.solved}</td>
                                <td class="${
                                  userObj.maxRating < 800 ? "red-flag" : ""
                                }">${userObj.maxRating}</td>
                                <td class="${
                                  userObj.currentRating < 800 ? "red-flag" : ""
                                }">${userObj.currentRating}</td>
                                <td>${userObj.score}</td>
                                <td class="${
                                  userObj.redFlags > 0 ? "red-flag" : ""
                                }">${userObj.redFlags}</td>
                            `;

          tbody.appendChild(tr);
        }

        // Update line chart with all users
        const xValues = userData.map((elem) => elem.name);
        const yValues = userData.map((elem) => elem.currentRating);

        // Destroy existing chart if it exists
        if (ratingChart) {
          ratingChart.destroy();
        }

        const ctx = document.getElementById("myChart").getContext("2d");
        ratingChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: xValues,
            datasets: [
              {
                label: "Rating",
                data: yValues,
                fill: false,
                tension: 0.1,
                borderColor: "#ffffff",
                backgroundColor: "#ffffff",
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#0a0a0a",
                pointBorderWidth: 2,
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "white",
                },
                grid: {
                  color: "#333",
                },
              },
              y: {
                beginAtZero: false,
                min: 300,
                max: userMaxRating+200,
                ticks: {
                  color: "white",
                },
                grid: {
                  color: "#333",
                },
              },
            },
          },
        });

        loading.classList.remove("active");
        document.getElementById("forcesUsername").value = ""; // Clear input after successful fetch
      })
      .catch((e) => {
        console.log(e);
        error.innerHTML = "Error fetching user ratings";
        loading.classList.remove("active");
      });
  }, 4000);
};

// Allow Enter key to trigger search
document
  .getElementById("forcesUsername")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      fetchUser();
    }
  });
