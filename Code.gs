function doGet() {
  try {
    // 1. เปลี่ยนจาก createHtmlOutputFromFile เป็น createTemplateFromFile
    var template = HtmlService.createTemplateFromFile('Index'); 
    
    // 2. ส่งค่าไปประมวลผล (evaluate)
    return template.evaluate()
      .setTitle('ระบบตรวจเช็คตู้ - CHAINARIS')
      .setFaviconUrl('https://www.chainaris.co.th/sites/5086/files/s/settings/o_1ih7f4n1sam1bbi1qqo2bv1e3bj.png')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) {
    return HtmlService.createHtmlOutput("Error: " + e.message);
  }
}

// 3. ย้ายฟังก์ชัน include ออกมาไว้นอก doGet (ห้ามลบเด็ดขาด)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function processForm(data) {
  // 1. ตั้งค่า ID ต่างๆ (ตรวจสอบให้ถูกต้อง)
  var folderId = "1u8Vo3psP-T3R5W545Sew_KSPgu42uHiX"; 
  var templateId = "1XfIxTzk8eL8rjAPLb3xLXBMq_Tl2y8Z-ZX5jtqcWWJk"; 
  
  var folder = DriveApp.getFolderById(folderId);
  
  // 2. จัดการรูปภาพลายเซ็น (บันทึกลง Drive ชั่วคราวเพื่อเอาไปใส่ใน Doc)
  var blob = Utilities.newBlob(Utilities.base64Decode(data.signature.split(",")[1]), "image/png", "Temp_Sig.png");
  
  // 3. คัดลอก Template เพื่อสร้างเอกสารใบใหม่
  var fileName = "ใบตรวจเช็ค_" + data.name + "_" + Utilities.formatDate(new Date(), "GMT+7", "dd-MM-yyyy");
  var copy = DriveApp.getFileById(templateId).makeCopy(fileName, folder);
  var doc = DocumentApp.openById(copy.getId());
  var body = doc.getBody();

  // 4. แทนที่ข้อความในเอกสาร
  body.replaceText("{{project}}", data.project);
  var dateNow = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy");
  body.replaceText("{{date}}", dateNow);
  body.replaceText("{{fromNo}}", data.fromNo);
  body.replaceText("{{boqNo}}",data.boqNo);
  body.replaceText("{{productNo}}",data.productNo);
  body.replaceText("{{pumpType}}",data.pumpType);
  body.replaceText("{{motorType}}",data.motorType);
  body.replaceText("{{motorKw}}",data.motorKw);
  body.replaceText("{{motorSpeed}}",data.motorSpeed);
  body.replaceText("{{breaker_info}}", data.breakerDetail);
  body.replaceText("{{motor_info}}", data.motorDetail);
  body.replaceText("{{phase_info}}", data.phaseDetail);
  body.replaceText("{{fuse_info}}", data.fuseDetail);
  body.replaceText("{{magnetic_info}}", data.magneticDetail);
  body.replaceText("{{overload_info}}", data.overloadDetail);
  body.replaceText("{{manual_info}}", data.manualDetail);
  body.replaceText("{{auto_info}}", data.autoDetail);
  body.replaceText("{{inverter_info}}", data.inverterDetail);
  body.replaceText("{{led_info}}", data.ledDetail);
  body.replaceText("{{lowlv_info}}", data.lowlvDetail);
  body.replaceText("{{highlv_info}}", data.highlvDetail);
  body.replaceText("{{type_product}}", data.type_product);
  body.replaceText("{{design}}", data.design);
  body.replaceText("{{status}}", data.status);
  body.replaceText("{{check1}}", data.check1);
  body.replaceText("{{check2}}", data.check2);
  body.replaceText("{{check3}}", data.check3);
  body.replaceText("{{check4}}", data.check4);
  body.replaceText("{{check5}}", data.check5);
  body.replaceText("{{check6}}", data.check6);
  body.replaceText("{{footletrod_count}}", data.footletrod_count);
  body.replaceText("{{footlethead_count}}", data.footlethead_count);
  body.replaceText("{{footletjoint_count}}", data.footletjoint_count);
  body.replaceText("{{float_count}}", data.float_count);
  body.replaceText("{{cup_type}}", data.cup_type);
  body.replaceText("{{cup_count}}", data.cup_count);
  body.replaceText("{{signature}}", data.signature);
  body.replaceText("{{date}}", Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm"));

  // 5. ค้นหาคำว่า {{sig}} แล้ววางรูปลายเซ็นทับลงไป
  var signaturePos = body.findText("{{sig}}");
  if (signaturePos) {
    var element = signaturePos.getElement();
    element.asText().setText(""); // ลบตัวอักษร {{sig}} ออก
    var img = element.getParent().asParagraph().appendInlineImage(blob);
    img.setWidth(120).setHeight(60); // ปรับขนาดลายเซ็นตามความเหมาะสม
  }

  doc.saveAndClose();
  
  return "บันทึกเรียบร้อยแล้ว!";
}