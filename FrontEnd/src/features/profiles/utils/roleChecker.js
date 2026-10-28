const roleChecker = (data)=>{
      return data == "admin" ? "مدیر" : data == "driver" ? "راننده" : "عادی"
}
export default roleChecker