// Inititalize all variables
const file_path = "assets/data/videos-stats.csv";
var videos_file_entry = new Array();
var videos_title = new Array();
var videos_id = new Array();
var videos_published = new Array();
var videos_caregory = new Array();
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
    videos_caregory.push(data["Keyword"]);
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

    // Create Table Cells - Category
    var table_cell = document.createElement('td');
    var video_index = videos_views.indexOf(sorted_views.at(-i));
    table_cell.innerText = capitalizeFirstLetter(videos_caregory[video_index]);
    table_row.appendChild(table_cell);

    // Create Table Cells - Views
    var table_cell = document.createElement('td');
    var video_index = videos_views.indexOf(sorted_views.at(-i));
    table_cell.innerText = capitalizeFirstLetter(videos_views[video_index]);
    table_row.appendChild(table_cell);

    // Create Table Cells - Likes
    var table_cell = document.createElement('td');
    var video_index = videos_views.indexOf(sorted_views.at(-i));
    table_cell.innerText = capitalizeFirstLetter(videos_likes[video_index]);
    table_row.appendChild(table_cell);
  }
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Init
async function init() {
  await parseData(file_path);
  createTops();
}

init();