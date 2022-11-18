// Inititalize all variables
const file_path = "assets/data/videos-stats.csv";
var videos_file_entry = new Array();
var videos_title = new Array();
var videos_id = new Array();
var videos_published = new Array();
var videos_keyword = new Array();
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
  });
}

// Build Top Videos Table
async function createTops() {

  // Clone the video views array and sort it
  var sorted_views = videos_views.map(function(e){return e;});
  sorted_views.sort(function(a, b){return a - b});

  var tops_table = document.getElementById("tops-table-body");
  for (var i = 1; i <= 10; i++) {
    // Create Table Rows and Headers
    var table_row = tops_table.insertRow();
    var table_header = document.createElement('th');
    table_header.scope = "row";
    table_header.innerText = i;
    table_row.appendChild(table_header);

    // Get index of sorted video
    var video_index = videos_views.indexOf(sorted_views.at(-i));

    // Create Table Cells
    addCellToTable(table_row, videos_title[video_index]); // Title
    addCellToTable(table_row, videos_keyword[video_index]); // Category
    addCellToTable(table_row, Math.trunc(videos_views[video_index]));  // Views
    addCellToTable(table_row, Math.trunc(videos_likes[video_index]));  // Likes
    addCellToTable(table_row, Math.trunc(videos_comments[video_index])); // Comments
    addCellToTable(table_row, videos_published[video_index]);  // Date
  }
  
  drawPieChart()
}

function addCellToTable (table_row, info) {
  var table_cell = document.createElement('td');
  table_cell.innerText = info;
  table_row.appendChild(table_cell);
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function drawPieChart() {

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
}

// Init
async function init() {
  await parseData(file_path);
  createTops();
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback( drawPieChart );
}

init();