// Inititalize all variables
const file_path = "assets/data/videos-stats.csv";
var videos_file_entry = new Array();
var videos_title = new Array();
var videos_id = new Array();
var videos_published = new Array();
var videos_keyword = new Array();
var videos_keyword_unique = [...new Set(videos_keyword)];
var videos_likes = new Array();
var videos_comments = new Array();
var videos_views = new Array();

let mapCategories_Views = new Map();
let mapCategories_Likes = new Map();
let mapCategories_Comments = new Map();

var sortedVideos_Views;
var mapVideos = new Map();

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

// Iterate through the CSV file and save data
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


// Build Top Videos Tab
async function createTops() {
  /* ------------------------- Create top videos table ------------------------ */
  createTopsOptions();
  createTopsTable(10);
  pagination();
  updateTable();

  /* --------------------------- Draw the pie chart --------------------------- */
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(function () { drawPieChart(10); });
}


function createTopsTable(num) {
  /* --------- Remove all contents from tops table and add new content -------- */
  d3.select("#tops-table-body")
  .html('')
  .selectAll("*")
  .remove(); 

  const tops_select = document.getElementById("tops-select");
  let sorted_videos;
    /* ---------------------- If the value selected is ALL ---------------------- */
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
  redirectingFromTableToYoutube();
}


function createTopsOptions() {
  const tops_select = document.getElementById("tops-select");

  /* ---------------------------- Create ALL option --------------------------- */
  let option = document.createElement("option");
  option.text = "ALL";
  option.value = "ALL";
  tops_select.appendChild(option);

  /* ---------------------- Create the remaining options ---------------------- */
  for (let keyword of videos_keyword_unique.sort()) {
    let option = document.createElement("option");
    option.text = keyword;
    option.value = keyword;
    tops_select.appendChild(option);
  }

  /* ---------------------------- Onclick an option --------------------------- */
  tops_select.onclick = function() { 
    createTopsTable(10);
    pagination();
    updateTable();
  };
} 


function drawPieChart(num) {
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
  var options = {
    title: "Category Pie Chart",
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
  createTopsTable(button.value);
  drawPieChart(button.value);
  pagination();
  updateTable();
}


function addCellToTable(table_row, info) {
  var table_cell = document.createElement("td");
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}

const rowsPerPage = 5;
// Get the table body element
const tableBody = document.getElementById("tops-table-body");
// Get the previous and next buttons
const prevButton = document.getElementById("prev-button-tops-table");
const nextButton = document.getElementById("next-button-tops-table");
// Set the initial page number to 1
let currentPage = 1;

function pagination() {

  // Set the initial page number
  

  /* ---------- Add event listeners to the previous and next buttons ---------- */
  prevButton.addEventListener("click", function() {
    if (currentPage > 1) {
      // Decrement the page number and update the table
      currentPage--;
      updateTable();
    }
  });
  
  nextButton.addEventListener("click", function() {
    // Check if the current page is the last page
    if (currentPage < getLastPage()) {
      // Increment the page number and update the table
      currentPage++;
      updateTable();
    } else {
      // Disable the next button if on the last page
      nextButton.disabled = true;
    }
  });
}

function updateTable() {

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
  
  // Get the number of rows in the table
  const rowCount = tableBody.querySelectorAll("tr").length;

  // Calculate the last page number
  return Math.ceil(rowCount / rowsPerPage);
}


function redirectingFromTableToYoutube() {
  var table = document.getElementById("tops-table-body");
  var rows = table.getElementsByTagName("tr");

 
  for (i = 0; i < rows.length; i++) {

    var currentRow = table.rows[i];

    var createOverHandler = function (row) {
      return function () {
        row.style.color = "#FF2F5F";   };
    };

    var createOutHandler = function (row) {
      return function () {
        row.style.color = 'black';   };
    };

    var createClickHandler = function(row) {
      return function() {
        var cell = row.getElementsByTagName("td")[0];
        var video_title = cell.innerHTML;
        video_id = videos_id[videos_title.indexOf(video_title)];
        window.open('https://www.youtube.com/watch?v=' + video_id);
      };
    };

    currentRow.onclick = createClickHandler(currentRow);
    currentRow.onmouseover = createOverHandler(currentRow);
    currentRow.onmouseout = createOutHandler(currentRow);

  }
  
}


///////////// BAR CHART  all categories //////////////
function barPlotAllCategories(data){
  const div = document.getElementById('divAllCategories');
  if (div.childNodes.length !== 0) {
    div.removeChild(div.childNodes[0]);
  }

  if (data == "views") {
    data =  dataViews.filter (function (d) {  return d.value > 90000000});
    
  } else if (data == "likes") {
    data =  dataLikes.filter (function (d) {  return d.value > 2905600; })
  }

  const tooltip = d3.select("body")
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

  // append the svg object to the body of the page
  const svg = d3.select("#divAllCategories")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
        .on("mouseover", function(d, i) {
          tooltip.html(` ${d.target.__data__.value}`).style("visibility", "visible");
          d3.select(this)
            .attr("fill", "#0047aa");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", bar_color);
        });


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
    var u = svg.selectAll("rect")
      .data(data)

    u
      .join("rect") // Add a new rect for each new elements
      .transition()
      .duration(1000)
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#0B5ED7")


  
}


// Initialize the plot with the first dataset

// Build the Bar Chart
function barPlotCategories() {

  const tooltip = d3.select("body")
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
  const margin = { top: 30, right: 60, bottom: 70, left: 70 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#barPlotCategories")
    .append("svg")
    .attr("id", "barPlotCategoriesSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .on("mouseover", function(d, i) {
      tooltip.html(` ${d.target.__data__.name}`).style("visibility", "visible");

    })
    .on("mousemove", function(){
      tooltip
        .style("top", (event.pageY-10)+"px")
        .style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function() {
      tooltip.html(``).style("visibility", "hidden");
    });

  var selectedCategory = document.getElementById("mySelect").value;

  data_views = mapCategories_Views.get(selectedCategory);
  data_likes = mapCategories_Likes.get(selectedCategory);

  var data = [["Views", data_views],["Likes", data_likes],];

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

  
  var myDiv = document.getElementById("divCategories");

  //Create array of options to be added
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.setAttribute("id", "mySelect");
  selectList.classList.add("form-select");

  myDiv.appendChild(selectList);

  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.setAttribute("value", options[i]);
    option.text = options[i];
    selectList.appendChild(option);
  }

  var categories_list = document.getElementById("mySelect");

  categories_list.addEventListener("click", function () {
    d3.select("#barPlotCategoriesSVG").remove();
    barPlotCategories();
  });
}


function wordCloud() {
  myWords = getWordCount(videos_keyword);

  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1300 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  var layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
      myWords.map(function (d) {
        return { text: d.word, size: d.size };
      })
    )
    
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
      .attr("text-anchor", "middle")
      .style("font-family", "trebuchet MS")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";})
      .text(function(d) { return d.text; })
      .on("click", function (d){
        chosen_category = d["target"]["__data__"]["text"];
        changeOption(chosen_category);

    })
      .text(function (d) {
        return d.text;
      });
      
  }

}


function changeOption(option){
  var select = document.getElementById("mySelect");
  select.value = option;
  d3.select("#barPlotCategoriesSVG").remove();
  barPlotCategories();

}


// ################################# DATA PROCESSING #################################
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


// Getting word count of categories
function getWordCount(words) {
  let map = new Map();
  for (let i = 0; i < words.length; i++) {
    let item = words[i];
    if (map.has(item)) {
      map.set(item, map.get(item) + 1);
    } else {
      map.set(item, 1);
    }
  }
  res = Array.from(map, ([name, value]) => ({ word: name, size: value }));
  return res;
}

// Init
async function init() {
  await parseData(file_path);
  preparingData();
  createTops();
  addOptionsDropdown(videos_keyword_unique);
  barPlotCategories();
  wordCloud();
  barPlotAllCategories("views");

}

init();
