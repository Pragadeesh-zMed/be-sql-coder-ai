let execQueryInfoModal = undefined;
display_InitialInfo = (response_data) => {
  let prompt = response_data.prompt || "";
  let sql_metadata = response_data.sql_metadata || "";
  let ollama_instructions = response_data.ollama_instructions || "";
  $(`#prompt`).val(prompt);
  $(`#sql_metadata`).val(sql_metadata);
  $(`#ollama_instructions`).val(ollama_instructions);
  let ollama_models = response_data.ollama_models || [];
  ollama_models.forEach((emodel) => {
    let option = $("<option/>", { text: emodel, value: emodel })[0];
    $(`#ai_model`).append(option);
  });
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
  $(`#save_prompt_btn`).hide();
  $(`#save_prompt_loader`).show();
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
  $(`#save_metadata_btn`).hide();
  $(`#save_metadata_loader`).show();
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

const saveOllamaInstructions = () => {
  $(`#save_ollama_instructions_btn`).hide();
  $(`#save_ollama_instructions_loader`).show();
  let payload = {};
  payload.instructions = $(`#ollama_instructions`).val();
  $.ajax({
    url: "/save/ollama_instructions",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#save_ollama_instructions_btn`).show();
      $(`#save_ollama_instructions_loader`).hide();
      display_alert("alert alert-success", `Saved..!`);
    },
    error: function (error) {
      $(`#save_ollama_instructions_btn`).show();
      $(`#save_ollama_instructions_loader`).hide();
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
const addExecuteQuestionTotheContent = (question) => {
  let quesDiv = $("<div/>", { class: `exec_ques_div` })[0];
  $(quesDiv).html(question);
  $(`#executor_chat_content_area`).append(quesDiv);
};
const displayExecQueryInfo = (response) => {
  $(`#exec_query_used`).html(response.query || "");
  let time_taken_in_ms = response.time_taken_in_ms || {};
  renderSecondsInTableDataField(
    `tat_query_gen`,
    time_taken_in_ms.generate_query || ""
  );
  renderSecondsInTableDataField(
    `tat_query_exec`,
    time_taken_in_ms.query_execution || ""
  );
  renderSecondsInTableDataField(
    `tat_ollama_conv`,
    time_taken_in_ms.gen_ai_response || ""
  );
  renderSecondsInTableDataField(
    `tat_total_response`,
    time_taken_in_ms.total_response || ""
  );
  execQueryInfoModal.show();
};
const renderSecondsInTableDataField = (elementId, value) => {
  if (value) {
    value = parseFloat(value / 1000);
    value = `${value}s`;
  }
  $(`#${elementId}`).html(value);
};
const addExecuteQueryResponseTotheContent = (response) => {
  let answer = response.response || "";
  let ansDiv = $("<div/>", { class: `exec_query_response_div` })[0];
  $(ansDiv).html(answer);
  let qResponse = response.query_response || [];
  let info_link = $("<button/>", {
    html: `<i class="fas fa-info-circle"></i> Info`,
    class: `btn btn-secondary`,
  })[0];
  $(info_link).click((e) => {
    displayExecQueryInfo(response);
  });
  $(ansDiv).append(info_link);
  if (Array.isArray(qResponse) && qResponse.length > 0) {
    let download_link = $("<button/>", {
      html: `<i class="fas fa-download"></i> Download`,
      class: `btn btn-secondary margin-left10px`,
    })[0];
    $(download_link).click((e) => {
      downloadCSV(qResponse, "download_file.csv");
    });
    $(ansDiv).append(download_link);
  }

  $(`#executor_chat_content_area`).append(ansDiv);
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

const executeQueryFortheQuestion = () => {
  $(`#get_exec_response_btn`).hide();
  $(`#get_exec_response_loader`).show();
  let payload = {};
  payload.question = $(`#exec_question`).val();
  payload.model = $(`#ai_model`).val();
  addExecuteQuestionTotheContent(payload.question);
  $(`#exec_question`).val(``);
  $.ajax({
    url: "/execute/query",
    type: "POST",
    contentType: "application/json", // Specify JSON content type
    data: JSON.stringify(payload),
    success: function (response) {
      $(`#get_exec_response_btn`).show();
      $(`#get_exec_response_loader`).hide();
      addExecuteQueryResponseTotheContent(response);
    },
    error: function (error) {
      $(`#get_exec_response_btn`).show();
      $(`#get_exec_response_loader`).hide();
      console.error("Error:", error);
      display_alert("alert alert-danger", `Error..!`);
    },
  });
};
function downloadCSV(data, filename) {
  // Convert data to CSV format
  const csvContent = data.map((row) => row.join(",")).join("\n");

  // Create a Blob object
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a link element
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  // Append the link to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
}
$(`#db_con_save_btn`).click((e) => {
  saveDBConnectionInfo();
});
$(`#save_prompt_btn`).click((e) => {
  savePrompt();
});
$(`#save_metadata_btn`).click((e) => {
  saveMetadata();
});
$(`#save_ollama_instructions_btn`).click((e) => {
  saveOllamaInstructions();
});
$(`#get_query_btn`).click((e) => {
  getQueryFortheQuestion();
});
$(`#get_exec_response_btn`).click((e) => {
  executeQueryFortheQuestion();
});
$(function () {
  getInitialInfo();
  execQueryInfoModal = new mdb.Modal(
    document.querySelector("#execQueryResponseInfoModal"),
    {
      keyboard: true,
    }
  );
});
