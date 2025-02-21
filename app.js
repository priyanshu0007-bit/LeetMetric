document.addEventListener("DOMContentLoaded", function () {

    const searchbtn = document.querySelector("#search-btn");
    const usernameInput = document.querySelector("#user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");

    const easyLabel = document.querySelector("#easy-label");
    const mediumLabel = document.querySelector("#medium-label");
    const hardLabel = document.querySelector("#hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    const validateUsername = (username) => {
        if (username.trim() === "") {
            alert("Username Should not be empty");
            return false;
        }
        const regex =  /^[a-zA-Z0-9_-]{1,30}$/;;
        const isMatching = regex.test(username);
        if(!isMatching) {
            alert("Invalid Username");
        }
        console.log("login username :", username.trim());
        return isMatching;
    }
    async function fetchUserDetail(username) {

        try {
            statsContainer.classList.add("hide")
            searchbtn.textContent = "Searching...";
            searchbtn.disabled = true;
            
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' ;
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            });
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedData = await response.json();
            console.log("Logging data : ", parsedData);
            displayUserData(parsedData);
            statsContainer.classList.remove("hide")
        }
        catch (error) {
            console.log(error);
            statsContainer.innerHTML = `<p>No data Found</p>`
        } finally {
            searchbtn.textContent = "Search";
            searchbtn.disabled = false;
        }
    }

    function updateProgress(solved,total,label,circle){
        const progressDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`)
        label.textContent=`${solved}/${total}`;
    }

    function displayUserData(parsedData){
        if (!parsedData || !parsedData.data || !parsedData.data.allQuestionsCount) {
            statsContainer.innerHTML = `<p>Invalid data format received</p>`;
            console.error("Unexpected data format:", parsedData);
            return;
        }
        const totalQues=parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues=parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues=parsedData.data.allQuestionsCount[2].count;
        const totalHardQues=parsedData.data.allQuestionsCount[3].count;

        // const solvedTotalQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;

        const solvedTotalEasyQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;


        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMediumQues,totalMediumQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);

        const cardsData=[
            {label:"overall Submission",values:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:"overall Easy Submission",values:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:"overall Medium Submission",values:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:"overall Hard Submission",values:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
        ];

        console.log("card Data :",cardsData);

        cardStatsContainer.innerHTML=cardsData.map(data=>{
            return `
            <div class="card">
            <h4>${data.label}</h4>
            <p>${data.values}</p>
            </div>
            `;
        }).join("")
        
    }

   

    

    searchbtn.addEventListener("click", () => {
        const username = usernameInput.value;
        console.log(username);
        if (validateUsername(username)) {
            fetchUserDetail(username);
        }
    })

})