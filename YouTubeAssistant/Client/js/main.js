document.addEventListener("DOMContentLoaded", () => {
    // GlobalVariables
    let id;
    let sentimentData;
    let baseLocalURL = 'http://127.0.0.1:8000/youtubeassist'
    //let baseCloudURL = 'https://youglance.herokuapp.com/youglance'
    //baseLocalURL = baseCloudURL
    // DOM Elements
    const suggestionsOutput = document.getElementById("SuggestionsOutput");
    const GlobalOutput = document.getElementById("output");
    const home = document.getElementById("home")
    const entityOutput = document.getElementById("EntityOutput");
    const tableOutput = document.getElementById("TableOutput");
    const inputElement = document.getElementById("keyword");
    const graphOutput = document.getElementById("graph-output");
    let barGraph = document.getElementById("bar-graph");
    let donutGraph = document.getElementById("donut-graph");
    const btn = document.getElementById("btn1");
    const showGraph = document.getElementById("btn2");
    const goBack = document.getElementById("btn3");
    const loadingHeader = document.getElementById("loadingHeader")
    const graphDiv = document.getElementById("graphs")
    const showReddit = document.getElementById("redditL");
    const redditTableOutput = document.getElementById("RedditTableOutput")
    const loadingHeader_R = document.getElementById("loadingHeader_R")
    const redditOutput = document.getElementById("redditOutput")
    const Rbtn = document.getElementById("Rtn");
    const Neg = document.getElementById("Neg")
    const Neu = document.getElementById("Neu")
    const Pos = document.getElementById("Pos")
    const senti_score = document.getElementById("senti_score")
    let cache_map = {}
    // Regex
    let regexReplace = /(<|>)/gi
    let regexSplit = /(v=| vi\/ | \/v\/ | youtu\.be\/ | \/embed\/)/
    let regexId = /[^0-9a-z\-*_$#!^]/i
    let regexUrlModify = /&.*/g

    const timeConvertor = (seconds) => {
        let str = ""
        let hrs = parseInt(seconds / 3600)
        let min_sec = seconds % 3600
        let min = parseInt(min_sec / 60);
        let sec = min_sec % 60
        str = hrs + ":" + min + ":" + sec.toFixed(2)
        return str
    }

    const getEntities = async (id) => {
       try{
           console.log("1")
        const res = await fetch(`${baseLocalURL}/get_unique_entities/${id}`)
        const data = await res.json();
        console.log(data)
        return data
       }
       catch(err){
           console.log(err)
           entityOutput.innerHTML=`<h3 class="text-center">Sorry ,We are unable to fetch insights of this video</h3>
           <h3 class="text-center">Try another video</h3>`
       }
    }

    const getGraphData = async(id)=>{
        try{
        const res  = await fetch(`${baseLocalURL}/sentiment/${id}`)
        const data = await res.json()
        return data
        }
        catch(err){
            console.log(err)
        }
    }

    const displayTableData = (data, tab) => {
        tableOutput.innerHTML = ""
        const ul = document.createElement("ul")
        ul.className = "list-group"
        if (data.length == 0) {
            tableOutput.innerHTML = `
            <span class="text-dark font-weight-bold f-3 text-center">No match found..<br>Try something related to video!!!</br></span>
            `
        }
        data.reverse()
        data.forEach(ele => {
            const li = document.createElement("li")
            li.className = "list-group-item list-group-item-action btn"
            li.innerHTML = `
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10"><span class="font-weight-bold">Text</span>: <span>${ele.text}</span> </div>
                <div class="col-md-1"></div>
            </div> 
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-sm-5"><span class="font-weight-bold">Start</span>: <span>${timeConvertor(ele.start)}</span> </div>
            
                <div class="col-md-1"></div>
            </div>
            `
            li.addEventListener("click", (e) => {
                e.preventDefault()
                let time = parseInt(ele.start)
                let baseUrl = tab.url.replace(regexUrlModify, "")
                let newUrl = baseUrl + "&t=" + time
                chrome.tabs.update(tab.id, { url: newUrl })
            })
            ul.appendChild(li)
        })
        tableOutput.appendChild(ul)
    }

    const getResponseByKeywordSubmit = async (id, keyWord, tab) => {
        //console.log(id,keyWord,tab)
        
        if(cache_map[keyWord]){
            displayTableData(cache_map[keyWord], tab)
        }else{
            const res = await fetch(`${baseLocalURL}/wild_card/${id}/${keyWord}`)
            const data = await res.json();
            cache_map[keyWord] = data
            console.log("DICTIONARY",cache_map)
            displayTableData(data, tab)

        }
        
    }

    const getResponseByEntity = async (id, query, tab) => {
        
        const dataObject = {
            video_id: id, query: query
        }
        const options = {
            method: "POST",
            body: JSON.stringify(dataObject),
            headers: {
                "Content-Type": "application/json"
            }
        }

        const res = await fetch(`${baseLocalURL}/search_by_ents`, options);
        const data = await res.json();
        console.log("Entity Data",query,data)
        displayTableData(data, tab)
    }

    const plotBarGraph = (key,value) => {
        loadingHeader.style.display="none";
        graphDiv.style.display="block"
        var ctx = document.getElementById("bar-chart").getContext('2d');
        let chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: key,
                datasets: [
                    {
                        label: "Entity-Frequncy",
                        backgroundColor: [
                            'rgb(201, 203, 207)',
                            'rgb(54, 162, 235)',
                      'rgb(75, 192, 192)',
                       'rgb(255, 99, 132)',
                            'rgb(75, 192, 192)',
                          ],
                        data: value
                    }
                ]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    fontStyle : 'bold',
                    fontSize : '18',
                    text: 'Count of Words/Entities'
                }
                
            }
        });
    }

    const plotDonutGraph = (key,value) => {
        loadingHeader.style.display="none";
        graphDiv.style.display="block"
        const ctx = document.getElementById("donut-chart").getContext("2d")
        let chart = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: key,
                datasets: [
                    {
                        label: "Sentiment-count",
                        backgroundColor: ['rgb(255, 99, 132)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)'],
                        data: value
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    fontStyle : 'bold',
                    fontSize : '18',
                    text: 'Sentiment Analysis Of Video'
                },
                legend:{
                    
                    labels :{
                        fontStyle:'bold',
                        fontColor:'black'
                    }
                }
            }
        });

    }

    const plotPieGraph_ForComments = (key,value) => {
        loadingHeader.style.display="none";
        graphDiv.style.display="block"
        const ctx = document.getElementById("comment-chart").getContext("2d")
        let chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: key,
                datasets: [
                    {
                        label: "Sentiment-count",
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)'
                          ],
                        data: value
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    fontStyle : 'bold',
                    fontSize : '18',
                    text: 'Sentiment Analysis Of Video Comments'
                },
                legend:{
                    
                    labels :{
                        fontStyle:'bold',
                        fontColor:'black'
                    }
                }
            }
        });

    }

    const getYTComments = async (videoId) => {
        try {
            let url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${videoId}&key=AIzaSyAONA2mgIhFNn0_qDU6JUA7nLK3MruVeFw`
            const res = await fetch(url)
            const data = await res.json();
            //console.log(data.items)
            let x = data.items
            x = cleanYTComments(x)
            let y = {comments: x}
            
            
            const rawResponse = await fetch(`${baseLocalURL}/comment_sentiment/${id}`, {
                        method: 'POST',
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(y)
                    });
            const content = await rawResponse.json();
            console.log("Test",content)
            let cumm = content.Cumulative
            if (cumm <= 0.2 && cumm > -0.2){
                        
                        Neu.setAttribute("class","progress-bar-striped progress-bar-animated progress-bar bg-warning ")
            }
            else if (cumm > 0.2){
                Pos.setAttribute("class","progress-bar-striped progress-bar-animated progress-bar")
            }
            else{
                Neg.setAttribute("class","progress-bar-striped progress-bar-animated progress-bar bg-danger ")
            }
            senti_score.textContent = "Viewer Sentiment Score: "+cumm.toFixed(3)
            plotPieGraph_ForComments(["Neutral","Positive","Negative"],[content.Neutral,content.Positive,content.Negative])
            return x
        }
        catch (err) {
            console.log(err)
            suggestionsOutput.innerHTML = `<h3 class="text-center">Sorry ${err}</h3>
            <h3 class="text-center">Try another video</h3>`
            return null
        }
    }

    const cleanYTComments = (items) => {
        let comm = []
        
        for(let i = 0;i<items.length;i++){
            let x = {
                "text": items[i].snippet.topLevelComment.snippet.textOriginal,
                "likes": items[i].snippet.topLevelComment.snippet.likeCount
            }
            comm[i] = x 
        }
        console.log("Dict",comm)
        return comm;
    }

    const getTopKeywords = async (id) => {
        try {
            let url = `https://youtube-assistant-keyword.herokuapp.com/api/v1/keyword/key/${id}`
            //let url = 'https://gorest.co.in/public/v1/users'
            const res = await fetch(url)
            const data = await res.json();
            //suggestionsOutput.innerHTML = `<h3 class="text-center">${data.keyList[0]}</h3>`
            if(data.keyList == null){
                return ["No Results"]
            }else{
                console.log(data.keyList)
                let x = data.keyList
                return x
            }
            
        }
        catch (err) {
            console.log(err)
            suggestionsOutput.innerHTML = `<h3 class="text-center">Sorry ${err}</h3>
            <h3 class="text-center">Try another video</h3>`
            return null
        }
    }

    const insertKey = async (id,inputValue) => {
        const rawResponse = await fetch(`https://youtube-assistant-keyword.herokuapp.com/api/v1/keyword/key/${id}`, {
                        method: 'POST',
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({'key': inputValue})
                    });
                    const content = await rawResponse.json();
                    console.log(content)
                    let x = content.keyList
                    console.log("XP",x)
                    return x
    }

    const extractREntity = (list) => {
        list.forEach((element,index) => {
            if(element!=null)
            {
                element = element.slice(25+1,element.length)
                console.log("Khatam kar bhar",element)
                list[index] = element.substring(0,element.indexOf('/'))
                console.log("Khatam kar bhar",list[index])
            }       
        });
        list = list.filter(e=>e!=null)
        return list
    }

    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {

        let url = tabs[0].url
        //if (url.includes("youtube") || url.includes("youtu.be")) {
        if (1) {

            //continue
            id = url.replace(regexReplace).split(regexSplit)[2]
            if (id != undefined) id = id.split(regexId)[0]
            entityOutput.innerHTML = `
            VideoId : <span class="text-danger font-weight-bold">${id}</span>
            <br>
            <br>
            <br>
            <img src="../1492.gif" class="center"  width="50" height="50" >
            `
            console.log(await getYTComments(id))
            console.log(await getTopKeywords(id))
            const topKeywords = await getTopKeywords(id);
            console.log("1 "+topKeywords)
            if(topKeywords) {
                let div = document.createElement("div")
                    div.setAttribute("class", "row ml-2")
                    div.innerHTML = ""
                if(topKeywords[0] == "No Results" || topKeywords.length == 0){
                    suggestionsOutput.innerHTML = 'No results at this moment..'
                    suggestionsOutput.appendChild(div)
                }else{
                    console.log("2 "+topKeywords)
                    
                    for (let i = 0; i < 5; i++) {
                        if (topKeywords[i] == undefined) break;
                        const col = document.createElement("radio");
                        col.innerHTML = `<label ><input type="checkbox" id=${i} name="radio1" value="${topKeywords[i]}"><span style="padding:10px; margin:10;font-size:18px">${topKeywords[i]}</span></label>`
                        div.appendChild(col)
                    }
                    //console.log("Yo",selectedKeywords)
                    const submitSelectedKeywordButton = document.createElement("button");
                    submitSelectedKeywordButton.setAttribute("class","btn btn-outline-danger");
                    submitSelectedKeywordButton.innerHTML="Search Keyword";
                    submitSelectedKeywordButton.addEventListener("click",(e)=>{
                        const selectedKeywords = document.querySelectorAll("input[name='radio1']:checked");
                        let temp =""
                        selectedKeywords.forEach(ele=>{
                            temp = temp+ele.value+" "
                        });
                        tableOutput.innerHTML = `<br>
                        <img src="../1492.gif" class="center"  width="50" height="50" >`
                        getResponseByKeywordSubmit(id,temp,tabs[0])
                        
                    })
                    div.appendChild(submitSelectedKeywordButton)
                    suggestionsOutput.innerHTML = ''
                    suggestionsOutput.appendChild(div)
            }
        }
            const { unique_ents } = await getEntities(id);
            
            if (unique_ents) {
                btn.disabled = false
                showGraph.disabled = false
                showReddit.disabled = false
                redditOutput.disabled = false
                let div = document.createElement("div")
                div.setAttribute("class", "row ml-2")
                div.innerHTML = ""
                for (let i = 0; i < 10; i++) {
                    if (unique_ents[i] == undefined) break;
                    const col = document.createElement("radio");
                    col.innerHTML = `<label ><input type="checkbox" id=${i} class="btn btn-danger" name="radio" value="${unique_ents[i]}"><span style="padding:10px; margin:10;font-size:18px">${unique_ents[i]}</span></label>`
                    div.appendChild(col)
                }
                const submitSelectedEntityButton = document.createElement("button");
                submitSelectedEntityButton.setAttribute("class","btn btn-outline-danger");
                submitSelectedEntityButton.innerHTML="Search Entities";
                                           
                document.getElementById("myList");
                submitSelectedEntityButton.addEventListener("click",(e)=>{
                    let entityArray = [];
                    e.preventDefault();
                    const selectedEntities = document.querySelectorAll("input[name='radio']:checked");
                    if(selectedEntities.length>0){
                        selectedEntities.forEach(ele=>{
                            entityArray.push(ele.value)
                        });
                        // Display loading Message;
                        tableOutput.innerHTML = `<br>
                        <img src="../1492.gif" class="center"  width="50" height="50" >`
                        getResponseByEntity(id,entityArray,tabs[0])
                    }
                    else{
                        tableOutput.innerHTML = `<span class="text-danger font-weight-bold f-2">Please select atleast one entity...</span>`
                    }
                
                })
                div.appendChild(submitSelectedEntityButton)
                entityOutput.innerHTML = ''
                entityOutput.appendChild(div)
            }

            btn.addEventListener("click", async (e) =>  {
                e.preventDefault();
                const inputValue = inputElement.value;
                if (inputValue == "") {
                    tableOutput.innerHTML = `
                    <span class="text-danger font-weight-bold f-2">Please enter some text to search...</span>
                    `
                }
                else {
                    tableOutput.innerHTML = `<br>
                    <img src="../1492.gif" class="center"  width="50" height="50" >`
                    
                    let x = await insertKey(id,inputValue)
                    console.log("X: ",x)
                    let div = document.createElement("div")
                    div.setAttribute("class", "row ml-2")
                    div.innerHTML = ""
                    for (let i = 0; i < 5; i++) {
                        if (x[i] == undefined) break;
                        const col = document.createElement("radio");
                        col.innerHTML = `<label ><input type="checkbox" id=${i} name="radio1" value="${x[i]}"><span style="padding:10px; margin:10;font-size:18px">${x[i]}</span></label>`
                        div.appendChild(col)
                    }
                    const submitSelectedKeywordButton = document.createElement("button");
                    submitSelectedKeywordButton.setAttribute("class","btn btn-outline-danger");
                    submitSelectedKeywordButton.innerHTML="Search Keywords";
                    submitSelectedKeywordButton.addEventListener("click",(_)=>{
                        const selectedKeywords = document.querySelectorAll("input[name='radio1']:checked");
                        let temp =""
                        selectedKeywords.forEach(ele=>{
                            temp = temp+ele.value+" "
                        });
                        tableOutput.innerHTML = `<br>
                        <img src="../1492.gif" class="center"  width="50" height="50" >`
                        getResponseByKeywordSubmit(id,temp,tabs[0])
                        
                    })
                    div.appendChild(submitSelectedKeywordButton)
                    suggestionsOutput.innerHTML = ''
                    suggestionsOutput.appendChild(div)
                    getResponseByKeywordSubmit(id, inputValue, tabs[0])
                }
            })

            showGraph.addEventListener("click",async (e) => {
                home.style.display="none";
                graphOutput.style.display="block";
                graphDiv.style.display="none";
                loadingHeader.style.display="block";

                e.preventDefault();
            
                const graphData = await getGraphData(id);
                let sentimentKeyArray=[]
                let sentimentValueArray=[]
                let countKeyArray=[]
                let countValueArray=[]
                if(graphData){
                    let countObject = graphData.label_stats;
                    for(let key in countObject){
                        countKeyArray.push(key);
                        countValueArray.push(countObject[key])
                    }
                    delete graphData.label_stats;
                    for(let key in graphData){
                        sentimentKeyArray.push(key);
                        sentimentValueArray.push(graphData[key])
                    }
                    

                }
                plotDonutGraph(sentimentKeyArray,sentimentValueArray);
                plotBarGraph(countKeyArray,countValueArray);
            })

            showReddit.addEventListener("click",async (e) => {
                home.style.display="none";
                redditOutput.style.display="block";
                graphDiv.style.display="none";
                loadingHeader_R.style.display="block";

                redditTableOutput.innerHTML = ""
                
        
                e.preventDefault();
                const rawResponse = await fetch(`https://youtube-assistant-keyword.herokuapp.com/api/v1/keyword/entity/redditData`, {
                        method: 'POST',
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({'entList': unique_ents})
                    });
                    const content = await rawResponse.json();
                    console.log(content)
                    if(content){
                        let urlR = content.urls.filter(e=>e!=null)
                        console.log(urlR)
                        let rList = extractREntity(content.urls)
                        console.log(rList)
                        loadingHeader_R.style.display="none"
                        
                        urlR.forEach((element,index)=> {
                        let div = document.createElement("div")
                        //div.className = "list-group-item list-group-item-action btn"
                        div.innerHTML = `<div class="grid-item" width="100"><div class="alert alert-dark">
                        <img src="./reddit(Trans).png"  id="redditL" width="75" class="btn" height="63" disabled></img>
                        <a href=${element} target="_blank" >
                        ${rList[index]}
                        </a>
                    </div>
                    </div>
                
                        `
                        redditTableOutput.appendChild(div)
                })
                
                    }

                
            })

            Rbtn.addEventListener("click",(e)=>{
                e.preventDefault();
                redditOutput.style.display="none";
                home.style.display="block";
                loadingHeader_R.style.display="none";
            })

            goBack.addEventListener("click",(e)=>{
                e.preventDefault();
                graphOutput.style.display="none";
                home.style.display="block";
                loadingHeader.style.display="none";
            })

            
        }
        else {
            document.body.innerHTML = '<h2 class="text-center text-dark mt-5">Site is not Youtube</h2>'
        }
        
    })


})