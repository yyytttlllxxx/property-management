import http from '@/utils/http'
//获取列表
export async function getListApi(parm) {
    return await http.get("/api/sysNotice/list", parm)
}
//获取最新
export async function getOneApi(parm) {
    return await http.get("/api/sysNotice/one", parm)
}
//新增
export async function addApi(parm) {
    return await http.post("/api/sysNotice", parm)
}
//编辑
export async function editApi(parm) {
    return await http.put("/api/sysNotice", parm)
}
//删除
export async function deleteApi(parm) {
    return await http.delete("/api/sysNotice", parm)
}
//AI润色公告内容
export async function polishContentApi(parm) {
    return await http.post("/api/sysNotice/polish", parm)
}