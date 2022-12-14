// Inititalize all variables
const file_path = "assets/data/videos-stats.csv";
let videos_file_entry = new Array();
let videos_title = new Array();
let videos_id = new Array();
let videos_published = new Array();
let videos_keyword = new Array();
let videos_keyword_unique = [...new Set(videos_keyword)];
let videos_likes = new Array();
let videos_comments = new Array();
let videos_views = new Array();
let sortedVideos_Views;

let mapCategories_Views = new Map();
let mapCategories_Likes = new Map();
let mapCategories_Comments = new Map();

let mapVideos = new Map();

class VideoStructure {
  constructor(title, id, published_date, keyword, likes, comments, views) {
    this.title = title;
    this.id = id;
    this.published_date = published_date;
    this.keyword = keyword;
    this.likes = likes;
    this.comments = comments;
    this.views = views;
  }
}

/* --------------- Iterate through the CSV file and save data --------------- */
async function parseData(file) {
  await d3.csv(file, function (data) {
    videos_file_entry.push(data[""]);
    videos_title.push(data["Title"]);
    videos_id.push(data["Video ID"]);
    videos_published.push(data["Published At"]);
    videos_keyword.push(data["Keyword"]);
    videos_likes.push(data["Likes"]);
    videos_comments.push(data["Comments"]);
    videos_views.push(data["Views"]);
    videos_keyword_unique = [...new Set(videos_keyword)];

    if (mapCategories_Views.has(data["Keyword"])) {
      mapCategories_Views.set(
        data["Keyword"],
        mapCategories_Views.get(data["Keyword"]) + parseInt(data["Views"])
      );
    } else {
      mapCategories_Views.set(data["Keyword"], parseInt(data["Views"]));
    };

    if (mapCategories_Likes.has(data["Keyword"])) {
      mapCategories_Likes.set(
        data["Keyword"],
        mapCategories_Likes.get(data["Keyword"]) + parseInt(data["Likes"])
      );
    } else {
      mapCategories_Likes.set(data["Keyword"], parseInt(data["Likes"]));
    };

    if (mapCategories_Comments.has(data["Keyword"])) {
      mapCategories_Comments.set(
        data["Keyword"],
        mapCategories_Comments.get(data["Keyword"]) + parseInt(data["Comments"])
      );
    } else {
      mapCategories_Comments.set(data["Keyword"], parseInt(data["Comments"]));
    };

    mapVideos[data[""]] = new VideoStructure (
      title = data.Title, 
      id = data["Video ID"], 
      published_date = data["Published At"], 
      keyword = data.Keyword,
      likes = parseInt(data.Likes),
      comments = parseInt(data.Comments),
      views = parseInt(data.Views)
    );
  });
}

/* -------------------------------------------------------------------------- */
/*               Logic belonging to the top videos trending page              */
/* -------------------------------------------------------------------------- */
let currentTops = 10;
async function createTops() {
  ``` 
  On load builder for the top trending videos page
  ``` 
  /* ------------------------- Create top videos table ------------------------ */
  createTopsOptions();
  createTopsTable(currentTops);
  pagination();
  updateTable();

  /* --------------------------- Draw the pie chart --------------------------- */
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(function () { drawPieChart(10); });
}


function createTopsTable(num) {
  ``` 
  Creates the Top Videos Table based on current top choice
  ``` 

  const topsHeader = document.getElementById("tops-header");
  topsHeader.innerText = "Videos Trending - Top " + num;
  /* --------- Remove all contents from tops table and add new content -------- */
  d3.select("#tops-table-body")
    .html('')
    .selectAll("*")
      .remove(); 

  const tops_select = document.getElementById("tops-select");
  let sorted_videos;
    /* ---------------------- If the option selected is ALL ---------------------- */
    if (tops_select.value == "ALL") {
      /* -------------- Sort and map the videos by views - descending ------------- */
      sorted_videos = sortedVideos_Views.slice(0,num).map(function (e) { return mapVideos[e] });
    }
    /* ------------------ In case of another option was chosen ------------------ */
    else {
      const points_dict = {};
      /* ------------ Get all videos category that match the chosen one ----------- */
      for (let [key, elem] of Object.entries(mapVideos)) {
        if (elem.keyword == tops_select.value) {
          if (!points_dict[key]) {
            points_dict[key] = elem;
          }
        }
      }
      /* -------------- Sort and map the videos by views - descending ------------- */
      sorted_videos = Object.keys(points_dict).sort((a, b) => points_dict[b].views - points_dict[a].views);
      sorted_videos = sorted_videos.slice(0,num).map(function (e) { return points_dict[e] });
    }

  const tops_table_div = document.getElementById("tops-table-body");
  for (let i = 0; i < num; i++) {
    /* ---------------------- Create Table Rows and Headers --------------------- */
    const table_row = tops_table_div.insertRow();
    const table_header = document.createElement("th");
    table_header.scope = "row";
    table_header.innerText = i + 1;
    table_row.appendChild(table_header);

    const video = sorted_videos[i]

    /* --------------------------- Create Table Cells --------------------------- */
    addCellToTable(table_row, video.title); // Title
    addCellToTable(table_row, video.keyword); // Category
    addCellToTable(table_row, video.views); // Views
    addCellToTable(table_row, video.likes); // Likes
    addCellToTable(table_row, video.comments); // Comments
    addCellToTable(table_row, video.published_date); // Date
  };

  /* ---------------------- Aplly hyperlink to table rows --------------------- */
  redirectingFromTableToYoutube();
}


function createTopsOptions() {
  ``` 
  Builds and displays the dropdown with all the categories for the tops page
  ```
  const tops_select = document.getElementById("tops-select");

  /* ---------------------------- Create ALL option --------------------------- */
  let option = document.createElement("option");
  option.text = "Categories - ALL";
  option.value = "ALL";
  tops_select.appendChild(option);

  let input = document.createElement("input");
  input.placeholder = "Search options";
  input.type = "text";
  input.id = "search-input";
  tops_select.appendChild(input);

  /* ---------------------- Create the remaining options ---------------------- */
  for (let keyword of videos_keyword_unique.sort()) {
    let option = document.createElement("option");
    option.text = keyword;
    option.value = keyword;
    tops_select.appendChild(option);
  }

  /* ---------------------------- Onclick an option --------------------------- */
  tops_select.onclick = function() { 
    createTopsTable(currentTops);
    currentPage = 1;
    updateTable();
    const tablePage = document.getElementById("tops-table-page");
    tablePage.innerText = "page " + currentPage + "/" + getLastPage();
  };
} 


function drawPieChart(num) {
  ``` 
  Builds and displays the Google Pie Chart
  ```

  /* -------------- Sort and map the videos by views - descending ------------- */
  sorted_videos = sortedVideos_Views.slice(0,num).map(function (e) { return mapVideos[e] });

  /* ---------- Get all keywords and count the number of appearences ---------- */
  const pie_chart_dict = {};
  for (const video of Object.values(sorted_videos)) {
    if (video.keyword in pie_chart_dict) {
      pie_chart_dict[video.keyword] += 1;
    }
    else { 
      pie_chart_dict[video.keyword] = 1; 
    }
  }

  /* --------- Sort the dict in order for big values to be neighbours --------- */
  const sortedPairs = Object.entries(pie_chart_dict).sort((a, b) => a[1] - b[1]);
  const sortedDict = Object.fromEntries(sortedPairs);

  /* ------------------------- Create the data table. ------------------------- */
  const data = new google.visualization.DataTable();

  /* ----------------------- Add first and second column ---------------------- */
  data.addColumn("string", "Keyword");
  data.addColumn("number", "Number of Appearences");

  /* ----------------------------- Add table rows ----------------------------- */
  for (let [keyword, counter] of Object.entries(sortedDict)) {
    data.addRow([keyword, counter]);
  }

  /* --------------------- Set chart configuration options -------------------- */
  let options = {
    title: "Top " + currentTops + " Categories - Pie Chart",
    is3D: false,
    subtitlePosition: 'left',
    pieHole: 0.4,
    sliceVisibilityThreshold: 0.05
  };

  /* ------------------- Instantiate and draw the pie chart ------------------- */
  const chart = new google.visualization.PieChart(
    document.getElementById("pie-chart-div")
  );
  chart.draw(data, options);
}


function topsButtonClicked(button) {
  ``` 
  Function called when the top 10 or top 25 buttons have been clicked.
  ```

  /* -------- Sets the value of current tops and re-displays everything ------- */
  currentTops = button.value;
  createTopsTable(button.value);
  drawPieChart(button.value);

  /* -------------------------- Resets the pagination ------------------------- */
  currentPage = 1;
  updateTable();
  const tablePage = document.getElementById("tops-table-page");
  tablePage.innerText = "page " + currentPage + "/" + getLastPage();
}


function addCellToTable(table_row, info) {
  ``` 
  Function used to facilitate logic of adding videos to the tops table
  ```
  let table_cell = document.createElement("td");
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}


function redirectingFromTableToYoutube() {
  ``` 
  Assigns an hyperlink to each row of the tops table
  ```

  // Get the table body element
  let table = document.getElementById("tops-table-body");
  let rows = table.getElementsByTagName("tr");

  // Loop through the rows and add event listeners to each row
  for (i = 0; i < rows.length; i++) {

    let currentRow = table.rows[i];
    let createOverHandler = function (row) { 
      return function () {
        row.style.color = "#FF2F5F"; // change color on mouseover to red, so that user can see that he can click on the row to go to the video
        row.style.cursor = "pointer";
         };
    };

    let createOutHandler = function (row) {
      return function () {
        row.style.color = 'black';
         };
    };

    let createClickHandler = function(row) {
      return function() {
        let cell = row.getElementsByTagName("td")[0];
        let video_title = cell.innerHTML;
        video_id = videos_id[videos_title.indexOf(video_title)];
        window.open('https://www.youtube.com/watch?v=' + video_id);
      };
    };

    currentRow.onclick = createClickHandler(currentRow);
    currentRow.onmouseover = createOverHandler(currentRow);
    currentRow.onmouseout = createOutHandler(currentRow);

  }
  
}


/* -------------------------------------------------------------------------- */
/*      Logic belonging to the pagination of the top videos trending page     */
/* -------------------------------------------------------------------------- */
const rowsPerPage = 10;

// Get the table body element
const tableBody = document.getElementById("tops-table-body");

// Get the previous and next buttons
const prevButton = document.getElementById("prev-button-tops-table");
const nextButton = document.getElementById("next-button-tops-table");

// Set the initial page number to 1
let currentPage = 1;

function pagination() {
  ``` 
  Paginates the results from the tops table according to a certain number of rows per page
  ```
  
  const tablePage = document.getElementById("tops-table-page");

  /* ---------- Add event listeners to the previous and next buttons ---------- */
  prevButton.addEventListener("click", function() {
    if (currentPage > 1) {
      // Decrement the page number and update the table
      currentPage--;
      updateTable();
      tablePage.innerText = "page " + currentPage + "/" + getLastPage();
    }
  });
  
  nextButton.addEventListener("click", function() {
    // Check if the current page is the last page
    if (currentPage < getLastPage()) {
      // Increment the page number and update the table
      currentPage++;
      updateTable();
      tablePage.innerText = "page " + currentPage + "/" + getLastPage();
    } else {
      // Disable the next button if on the last page
      nextButton.disabled = true;
    }
  });
}


function updateTable() {
  ``` 
  Updates the table on any event related to the tops page
  ```

  // Get the rows of the table
  const rows = tableBody.querySelectorAll("tr");

   // Enable the next button if not on the last page
   if (currentPage < getLastPage()) {
    nextButton.disabled = false;
  }
  else {nextButton.disabled = true;}

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Loop through the rows and show only the rows within the start and end indices
  for (let i = 0; i < rows.length; i++) {
    if (i >= startIndex && i < endIndex) {
      rows[i].style.display = "table-row";
    } else {
      rows[i].style.display = "none";
    }
  }
}


function getLastPage() {
  ``` 
  Calculates the maximum number of pages that the tops table will have
  ```
  // Get the number of rows in the table
  const rowCount = tableBody.querySelectorAll("tr").length;

  // Calculate the last page number
  return Math.ceil(rowCount / rowsPerPage);
}


// ----------------------- BAR CHART  ALL CATEGORIES -----------------------

function barPlotAllCategories(data){
  //If there is already a bar plot, remove it before drawing a new one
  const div = document.getElementById('divAllCategories');
  if (div.childNodes.length !== 0) {
    div.removeChild(div.childNodes[0]);
  }

  //The user choose which data wants to see
  if (data == "views") {
    data =  dataViews.filter (function (d) {  return d.value > 90000000});
    
  } else if (data == "likes") {
    data =  dataLikes.filter (function (d) {  return d.value > 2905600; });
  }
  data.sort(function (a, b) { return b.value - a.value; });

  // Get the values of the selected data in the graph
  const tooltip = d3.select("body") // Code from https://d3-graph-gallery.com/graph/interactivity_tooltip.html#template
  .append("div")
  .attr("class","d3-tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("padding", "15px")
  .style("background", "rgba(0,0,0,0.6)")
  .style("border-radius", "5px")
  .style("color", "#fff")
  .text("a simple tooltip");

  // set the dimensions and margins of the graph  
  const margin = {top: 30, right: 30, bottom: 70, left: 80},
      width = 1280 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page, code from https://d3-graph-gallery.com/graph/barplot_animation_start.html 
  const svg = d3.select("#divAllCategories")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
        .on("mouseover", function(d, i) {
          if (!Number.isInteger(d.target.__data__) && typeof d.target.__data__ != "string") {
            tooltip.html(` ${d.target.__data__.value}`).style("visibility", "visible");
            d3.select(this)
              .attr("fill", "#0047aa");
          }
        })
        .on("mouseout", function(d, i) {
          tooltip.html(` ${d.target.__data__.value}`).style("visibility", "hidden");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
     ;


  // Initialize the X axis
  const x = d3.scaleBand()
    .range([ 0, width ])
    .padding(0.2);
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)

  // Initialize the Y axis
  const y = d3.scaleLinear()
    .range([ height, 0]);
  const yAxis = svg.append("g")
    .attr("class", "myYaxis")


  // A function that create / update the plot for a given variable:

    // Update the X axis
    x.domain(data.map(d => d.name))
    xAxis.call(d3.axisBottom(x))

    // Update the Y axis
    y.domain([0, d3.max(data, d => d.value) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Create the u variable
    let u = svg.selectAll("rect")
      .data(data)

    u.join("rect") // Add a new rect for each new elements
      .transition()
      .duration(1000)
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#0B5ED7")
}

// ----------------------- BAR CHART  CATEGORIES -----------------------

function barPlotCategories() {

  // Get the values of the selected data in the graph

  const tooltip = d3.select("body") // Code from https://d3-graph-gallery.com/graph/interactivity_tooltip.html#template
  .append("div")
  .attr("class","d3-tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("padding", "15px")
  .style("background", "rgba(0,0,0,0.6)")
  .style("border-radius", "5px")
  .style("color", "#fff")
  .text("a simple tooltip");

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 60, bottom: 70, left: 80 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  // original code from https://d3-graph-gallery.com/graph/barplot_button_data_simple.html 
  let svg = d3
    .select("#barPlotCategories")
    .append("svg")
    .attr("id", "barPlotCategoriesSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .on("mouseover", function(d, i) {
      if (!Number.isInteger(d.target.__data__) && typeof d.target.__data__ != "string") {
        tooltip.html(` ${d.target.__data__[1]}`).style("visibility", "visible");
      }
    })
    .on("mousemove", function(){
      tooltip
        .style("top", (event.pageY-10)+"px")
        .style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function() {
      tooltip.html(``).style("visibility", "hidden");
    });

  let selectedCategory = document.getElementById("mySelect").value;

  data_views = mapCategories_Views.get(selectedCategory);
  data_likes = mapCategories_Likes.get(selectedCategory);

  let data = [["Views", data_views],["Likes", data_likes],];

  max_value = Math.max(data_views, data_likes);

  // sort data
  data.sort(function (b, a) {
    return a.Value - b.Value;
  });

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map((d) => d[0]))
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, max_value + 1000])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll("mybar")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[1]))
    .attr("fill", "#01A5EE");
}


// Adding categories to the dropdown menu
function addOptionsDropdown(options) {

  let myDiv = document.getElementById("divCategories");

  //Create and append form-select to div
  let selectList = document.createElement("select");
  selectList.setAttribute("id", "mySelect");
  selectList.classList.add("form-select");
  myDiv.appendChild(selectList);

  //Create and append the options
  for (let i = 0; i < options.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("value", options[i]);
    option.text = options[i];
    selectList.appendChild(option);
  }

  // Adding event listener to the dropdown menu
  let categories_list = document.getElementById("mySelect");
  categories_list.addEventListener("click", function () {
    d3.select("#barPlotCategoriesSVG").remove();
    barPlotCategories();
  });
}


function wordCloud() {
  ``` 
  Builds and displays the word cloud
  ```

  //getting the words to build the word cloud
  myWords = getWordCount(videos_keyword);

  // set the dimensions and margins of the graph
  let margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1300 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  // Original code from: https://d3-graph-gallery.com/graph/wordcloud_size.html 

  let layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
      myWords.map(function (d) {
        return { text: d.word, size: d.size };
      }))
    .padding(5) //space between words
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d) {
      return d.size;
    }) // font size of words
    .on("end", draw);
  layout.start();

  // This function takes the output of 'layout' above and draw the words
  // Wordcloud features that are THE SAME from one word to the other can be here
  // This code was also taken from: https://d3-graph-gallery.com/graph/wordcloud_size.html
  function draw(words) {

    svg
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", function (d) {return d.size;})
      .style("fill", "#01A5EE")
      .style("cursor", "pointer") //changing the cursor to a pointer when hovering over the word to indicate to the user that he is able to click on it
      .on("mouseover", function () {
        d3.select(this)
          .style("fill", "#0040FF"); //changing the color of the word when hovering over it
        })
      .on("mouseout", function () {
          d3.select(this)
            .style("fill", "#01A5EE"); 
          })
      .attr("text-anchor", "middle")
      .style("font-family", "trebuchet MS")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";})
      .text(function(d) { return d.text; })
      .on("click", function (d){
        chosen_category = d["target"]["__data__"]["text"]; //getting the category name in the cloud clicked
        changeOption(chosen_category);

      })
      .text(function (d) {
        return d.text;
      });
      
  }

}


function changeOption(option){ // Changing the option in the dropdown menu to change the information in the bar plot
  let select = document.getElementById("mySelect");
  select.value = option;
  d3.select("#barPlotCategoriesSVG").remove();
  barPlotCategories();

}


// -----------------------  DATA PROCESSING -----------------------

function preparingData() { // Preparing data for the bar plot
  sortedVideos_Views = Object.keys(mapVideos).sort((a, b) => mapVideos[b].views - mapVideos[a].views);
  
  dataViews = Array.from(mapCategories_Views, ([name, value]) => ({
    name,
    value,
  }));
  dataLikes = Array.from(mapCategories_Likes, ([name, value]) => ({
    name,
    value,
  }));
  return [dataViews, dataLikes];
}


// Getting word counts of categories
function getWordCount(words) {
  let map = new Map();
  for (let i = 0; i < words.length; i++) { 
    let item = words[i];
    if (map.has(item)) { //building a map with the categories as keys and the number of times they appear as values
      map.set(item, map.get(item) + 1);
    } else {
      map.set(item, 1);
    }
  }
  res = Array.from(map, ([name, value]) => ({ word: name, size: value }));
  return res;
}

// Init
async function init() { // Initializing the page with the data
  await parseData(file_path);
  preparingData();
  createTops();
  addOptionsDropdown(videos_keyword_unique);
  barPlotCategories();
  wordCloud();
  barPlotAllCategories("views");

}

init();
