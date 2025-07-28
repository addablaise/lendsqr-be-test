import axios from 'axios'
import { AdjutorResponse } from './types'

const baseURL = process.env.ADJUTOR_BASE_URL
const apiKey = process.env.ADJUTOR_API_KEY

export async function checkBlacklist(payload: { email: string, phone: string }): Promise<AdjutorResponse> {
  try {
    const res = await axios.post(`${baseURL}/karma/verify`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    })

    return {
      success: true,
      blacklisted: res.data?.data?.blacklisted || false,
      raw: res.data
    }
  } catch (error: any) {
    return {
      success: false,
      blacklisted: false,
      raw: error?.response?.data || { message: 'Adjutor request failed' }
    }
  }
}
