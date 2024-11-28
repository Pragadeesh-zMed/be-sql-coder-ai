display_InitialInfo = (response_data) => {
  let prompt = response_data.prompt || "";
  let sql_metadata = response_data.sql_metadata || "";
  $(`#prompt`).val(prompt);
  $(`#sql_metadata`).val(sql_metadata);
  let sql_db_connection_info = response_data.sql_db_connection_info || {};
  let host = sql_db_connection_info.host || "";
  let port = sql_db_connection_info.port || "";
  let user = sql_db_connection_info.user || "";
  let password = sql_db_connection_info.password || "";
  let database = sql_db_connection_info.database || "";
  setValueToField("host", host);
  setValueToField("port", port);
  setValueToField("user", user);
  setValueToField("password", password);
  setValueToField("database", database);
  if (sql_db_connection_info.connection_status) {
    updateConnectionStatus("badge-success", "Connected");
  } else {
    updateConnectionStatus("badge-danger", "Not connected");
  }
};
updateConnectionStatus = (badge_color, content) => {
  $(`#con_status`).removeClass();
  $(`#con_status`).addClass(`badge rounded-pill ${badge_color}`);
  $(`#con_status`).html(`${content}`);
};
setValueToField = (element_id, value) => {
  $(`#${element_id}`).val(value);
  $(`#${element_id}`).focus();
};
display_alert = (alertClass, htmlContent) => {
  $(`#app_alert`).removeClass();
  $(`#app_alert`).addClass("alert alert-success");
  $(`#app_alert`).html(`Saved..!`);
  setTimeout((e) => {
    $(`#app_alert`).removeClass();
    $(`#app_alert`).addClass("none");
    $(`#app_alert`).html(``);
  }, 2500);
};
getInitialInfo = () => {
  $.ajax({
    url: "/get/all_info",
    type: "GET",
    contentType: "application/json", // Specify JSON content type
    success: function (response) {
      display_InitialInfo(response);
    },
    error: function (error) {
      $(`#analyze_btn`).show();
      $(`#analyze_loader`).hide();
      console.error("Error:", error);
    },
  });
};

const savePrompt = () => {
  let payload = {};
  payload.prompt = $(`#prompt`).val();
  $.ajax({
    url: "/save/prompt",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#save_prompt_btn`).show();
      $(`#save_prompt_loader`).hide();
      display_alert("alert alert-success", `Saved..!`);
    },
    error: function (error) {
      $(`#save_prompt_btn`).show();
      $(`#save_prompt_loader`).hide();
      console.error("Error:", error);
      display_alert("alert alert-danger", `Error..!`);
    },
  });
};

const saveMetadata = () => {
  let payload = {};
  payload.sql_metadata = $(`#sql_metadata`).val();
  $.ajax({
    url: "/save/metadata",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#save_metadata_btn`).show();
      $(`#save_metadata_loader`).hide();
      display_alert("alert alert-success", `Saved..!`);
    },
    error: function (error) {
      $(`#save_metadata_btn`).show();
      $(`#save_metadata_loader`).hide();
      console.error("Error:", error);
      display_alert("alert alert-danger", `Error..!`);
    },
  });
};

const addQuestionTotheContent = (question) => {
  let quesDiv = $("<div/>", { class: `ques_div` })[0];
  $(quesDiv).html(question);
  $(`#query_chat_content_area`).append(quesDiv);
};
const addQueryResponseTotheContent = (response) => {
  let answer = response.query || "";
  let ansDiv = $("<div/>", { class: `query_response_div` })[0];
  $(ansDiv).html(answer);
  $(`#query_chat_content_area`).append(ansDiv);
};

const getQueryFortheQuestion = () => {
  $(`#get_query_btn`).hide();
  $(`#get_query_loader`).show();
  let payload = {};
  payload.question = $(`#question`).val();
  addQuestionTotheContent(payload.question);
  $(`#question`).val(``);
  $.ajax({
    url: "/get/query",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#get_query_btn`).show();
      $(`#get_query_loader`).hide();
      addQueryResponseTotheContent(response);
    },
    error: function (error) {
      $(`#get_query_btn`).show();
      $(`#get_query_loader`).hide();
      console.error("Error:", error);
      display_alert("alert alert-danger", `Error..!`);
    },
  });
};
saveDBConnectionInfo = () => {
  $(`#db_con_save_btn`).hide();
  $(`#db_con_save_loader`).show();
  let payload = {};
  payload.host = $(`#host`).val();
  payload.user = $(`#user`).val();
  payload.port = $(`#port`).val();
  payload.password = $(`#password`).val();
  payload.database = $(`#database`).val();
  $.ajax({
    url: "/save/db/connection",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#db_con_save_btn`).show();
      $(`#db_con_save_loader`).hide();
      display_alert("alert alert-success", `Saved..!`);
      if (response.connection_status) {
        updateConnectionStatus("badge-success", "Connected");
      } else {
        updateConnectionStatus("badge-danger", "Not connected");
      }
    },
    error: function (error) {
      $(`#db_con_save_btn`).show();
      $(`#db_con_save_loader`).hide();
      updateConnectionStatus("badge-danger", "Not connected");
      console.error("Error:", error);
    },
  });
};
$(`#db_con_save_btn`).click((e) => {
  saveDBConnectionInfo();
});
$(`#save_prompt_btn`).click((e) => {
  savePrompt();
});
$(`#save_metadata_btn`).click((e) => {
  saveMetadata();
});
$(`#get_query_btn`).click((e) => {
  getQueryFortheQuestion();
});
$(function () {
  getInitialInfo();
});
