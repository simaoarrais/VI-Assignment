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

let mapCategories_Stats = new Map();

let sum_categories_views = new Map();

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
    }

    if (mapCategories_Likes.has(data["Keyword"])) {
      mapCategories_Likes.set(
        data["Keyword"],
        mapCategories_Likes.get(data["Keyword"]) + parseInt(data["Likes"])
      );
    } else {
      mapCategories_Likes.set(data["Keyword"], parseInt(data["Likes"]));
    }

    if (mapCategories_Comments.has(data["Keyword"])) {
      mapCategories_Comments.set(
        data["Keyword"],
        mapCategories_Comments.get(data["Keyword"]) + parseInt(data["Comments"])
      );
    } else {
      mapCategories_Comments.set(data["Keyword"], parseInt(data["Comments"]));
    }
  });
}

// Build Top Videos Table
async function createTops() {
  console.log("Creating Top Videos Table");
  // Clone the video views array and sort it
  var sorted_views = videos_views.map(function (e) {
    return e;
  });
  sorted_views.sort(function (a, b) {
    return a - b;
  });

  var tops_table = document.getElementById("tops-table-body");
  for (var i = 1; i <= 10; i++) {
    // Create Table Rows and Headers
    var table_row = tops_table.insertRow();
    var table_header = document.createElement("th");
    table_header.scope = "row";
    table_header.innerText = i;
    table_row.appendChild(table_header);

    // Get index of sorted video
    var video_index = videos_views.indexOf(sorted_views.at(-i));

    // Create Table Cells
    addCellToTable(table_row, videos_title[video_index]); // Title
    addCellToTable(table_row, videos_keyword[video_index]); // Category
    addCellToTable(table_row, Math.trunc(videos_views[video_index])); // Views
    addCellToTable(table_row, Math.trunc(videos_likes[video_index])); // Likes
    addCellToTable(table_row, Math.trunc(videos_comments[video_index])); // Comments
    addCellToTable(table_row, videos_published[video_index]); // Date
  }

  //drawPieChart()
}

function addCellToTable(table_row, info) {
  var table_cell = document.createElement("td");
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function barPlotCategories() {

  // set the dimensions and margins of the graph
  const margin = {top: 30, right: 60, bottom: 70, left: 70},
  width = 600 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


  // append the svg object to the body of the page
  var svg = d3
    .select("#barPlotCategories")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  dataViews = Array.from(mapCategories_Views, ([name, value]) => ({
    name,
    value,
  }));
  dataLikes = Array.from(mapCategories_Likes, ([name, value]) => ({
    name,
    value,
  }));

/*   dataComments = Array.from(mapCategories_Comments, ([name, value]) => ({
    name,
    value,
  })); */

  var selectedCategory = document.getElementById("mySelect").value;
  console.log("selectedCategory", selectedCategory);

  data_views = mapCategories_Views.get(selectedCategory);
  data_likes = mapCategories_Likes.get(selectedCategory);
  //data_comments = mapCategories_Comments.get(selectedCategory);

  //var data = [['Views',data_views], ['Likes',data_likes], ['Comments',data_comments]];
   var data = [['Views',data_views], ['Likes',data_likes]];

  max_value = Math.max(data_views, data_likes);
  console.log("MAX VALUE", max_value);
  console.log("DATA", data[0][0], data[1], data[2]);


  // X axis
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(d => d[0]))
    .padding(0.2);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
  
  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, max_value+1000])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
  
  // Bars
  svg.selectAll("mybar")
    .data(data)
    .join("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[1]))
      .attr("fill", "#01A5EE")
  
}

/*function drawPieChart() {

  // Create the data table.
	var data = new google.visualization.DataTable();

  // First column
	data.addColumn('string', 'Keyword');

	// Second column
	data.addColumn('number', 'Category of Videos');

	data.addRows([
				['Tech', 79],
				['Music', 112],
				['Apple', 68],
        ['History', 83]
	]);

	// Set chart configuration options
	var options = {
		title : 'Category Pie Chart',
		is3D: false
	};

	// Instantiate the pie chart.
	var chart = new google.visualization.PieChart( document.getElementById('pie-chart-row') );
	debugger;
	// Draw the chart, passing in some configuration options.
	chart.draw(data, options);
}*/

function addOptionsDropdown(options) {
  var myDiv = document.getElementById("divCategories");

  //Create array of options to be added
  //Create and append select list
  var selectList = document.createElement("select");
  selectList.setAttribute("id", "mySelect");
  myDiv.appendChild(selectList);

  console.log("Adding Options to Dropdown");
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("option");
    option.setAttribute("value", options[i]);
    option.text = options[i];
    selectList.appendChild(option);
  }

  var categories_list = document.getElementById("mySelect");

  categories_list.addEventListener("click", function() {
    console.log("CLICKED");
    console.log("selectedCategory", categories_list.value);
    d3.select("svg").remove();
    barPlotCategories();
  });

}

function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  });
}

// Init
async function init() {
  await parseData(file_path);
  createTops();
  google.charts.load("current", { packages: ["corechart"] });
  //google.charts.setOnLoadCallback( drawPieChart );
  
  addOptionsDropdown(videos_keyword_unique);
  barPlotCategories();
  addCellToTable(); //problemas com esta funcao
}

init();
