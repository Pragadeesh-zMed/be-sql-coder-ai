display_InitialInfo = (response_data) => {
  let prompt = response_data.prompt || "";
  let sql_metadata = response_data.sql_metadata || "";
  $(`#prompt`).val(prompt);
  $(`#sql_metadata`).val(sql_metadata);
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

$(`#save_prompt_btn`).click((e) => {
  savePrompt();
});
$(`#save_metadata_btn`).click((e) => {
  saveMetadata();
});
$(function () {
  getInitialInfo();
});
