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


// Iterate through the CSV file and save data
async function parseData(file) {
  await d3.csv(file, function(data) {
    videos_file_entry.push(data[""]);
    videos_title.push(data["Title"]);
    videos_id.push(data["Video ID"]);
    videos_published.push(data["Published At"]);
    videos_keyword.push(data["Keyword"]);
    videos_likes.push(data["Likes"]);
    videos_comments.push(data["Comments"]);
    videos_views.push(data["Views"]);
    videos_keyword_unique = [...new Set(videos_keyword)];

  });
}

// Build Top Videos Tab
async function createTops() {
  var pie_chart_dict = {}

  /* ----------------- Clone the video views array and sort it ---------------- */
  var sorted_views = videos_views.map(function(e){return e;});
  sorted_views.sort(function(a, b){return a - b});

  /* --------------------- Create Table and add data to it -------------------- */
  var tops_table = document.getElementById("tops-table-body");
  for (var i = 1; i <= 10; i++) {
    var table_row = tops_table.insertRow();
    var table_header = document.createElement('th');
    table_header.scope = "row";
    table_header.innerText = i;
    table_row.appendChild(table_header);

    /* ------------------------ Get index of sorted video ----------------------- */
    var video_index = videos_views.indexOf(sorted_views.at(-i));

    /* --------------------------- Create Table Cells --------------------------- */
    addCellToTable(table_row, videos_title[video_index]); // Title
    addCellToTable(table_row, videos_keyword[video_index]); // Category
    addCellToTable(table_row, Math.trunc(videos_views[video_index]));  // Views
    addCellToTable(table_row, Math.trunc(videos_likes[video_index]));  // Likes
    addCellToTable(table_row, Math.trunc(videos_comments[video_index])); // Comments
    addCellToTable(table_row, videos_published[video_index]);  // Date

    /* -------------------- Get keywords and counter of tops -------------------- */
    keyword = videos_keyword[video_index];
    if (keyword in pie_chart_dict) { pie_chart_dict[keyword] += 1; }
    else { pie_chart_dict[keyword] = 1; }
  }

  /* --------------------------- Draw the pie chart --------------------------- */
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback( function(){ drawPieChart(pie_chart_dict) } );
}

function addCellToTable (table_row, info) {

  var table_cell = document.createElement('td');
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function barPlotCategories() {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 70, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#barPlotCategories")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

    // sort data
    data.sort(function(b, a) {
      return a.Value - b.Value;
    });

    // X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(function(d) { return d.Country; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 13000])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.Country); })
        .attr("y", function(d) { return y(d.Value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.Value); })
        .attr("fill", "#69b3a2")

  })
}

function drawPieChart(pie_chart_dict) {
  /* ------------------------- Create the data table. ------------------------- */
	var data = new google.visualization.DataTable();

  /* ----------------------- Add first and second column ---------------------- */
	data.addColumn('string', 'Keyword');
	data.addColumn('number', 'Category of Videos');

  /* ----------------------------- Add table rows ----------------------------- */
  for (let [key, value] of Object.entries(pie_chart_dict)) {
    data.addRow([key, value]);
  }

	/* --------------------- Set chart configuration options -------------------- */
	var options = {
		title : 'Category Pie Chart',
		is3D: false
	};

	/* ------------------- Instantiate and draw the pie chart ------------------- */
	var chart = new google.visualization.PieChart( document.getElementById('pie-chart-row') );
	debugger;
	chart.draw(data, options);
}

function addOptionsDropdown (options) {
  // console.log("INIT")
  var myDiv = document.getElementById("divCategories");

  //Create array of options to be added
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.setAttribute("id", "mySelect");
  myDiv.appendChild(selectList);


  // console.log("Adding Options to Dropdown");
  // console.log("Options", options);
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.setAttribute("value", options[i]);
    option.text = options[i];
    selectList.appendChild(option);
  }
}

// Init
async function init() {
  await parseData(file_path);
  // console.log("Im here")
  createTops();
  addOptionsDropdown(videos_keyword_unique);
  barPlotCategories();
  addCellToTable() ; //problemas com esta funcao
}

init();
