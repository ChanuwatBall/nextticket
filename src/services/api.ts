import axios from "axios";


const baseUrl = import.meta.env.VITE_API_URL;

const apiUrl = baseUrl + "/api";

export const createCharge = async (total:number, sourceType: string) => {   
     return await axios.post(`${apiUrl}/payment/${sourceType ==="alipay" ? "alipay-qr" : sourceType ==="wechat" ? "wechat-pay" : "qr" }`, {} ,
        { params: { amount: total } }
    ); 
}

export const getTransactionById = async (id: string) => {
    return await axios.get(`${apiUrl}/payment/transaction/${id}`); 
}

export const getCharge = async (chargeId: string) => {
   return await axios.get(`${apiUrl}/payment/transaction/${chargeId}`);
}


export default {}