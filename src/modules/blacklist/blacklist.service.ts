import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import db from '../../db/knex'

type Result = 'CLEAR' | 'BLACKLISTED' | 'ERROR'

const ADJUTOR_URL = process.env.ADJUTOR_BASE_URL!
const ADJUTOR_TOKEN = process.env.ADJUTOR_API_KEY!

async function checkValue(value: string): Promise<Result> {
  
  const url = `${ADJUTOR_URL}/verification/karma/${encodeURIComponent(value)}`
  try {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${ADJUTOR_TOKEN}` }
    })
    
    const body = resp.data
    const blacklisted = body.data?.reason != null

    await db('blacklist_checks').insert({
      id: uuidv4(),
      user_payload_hash: value,
      adjutor_request_id: body.meta?.request_id || null,
      result: blacklisted ? 'BLACKLISTED' : 'CLEAR',
      raw_response: JSON.stringify(body)
    })

    return blacklisted ? 'BLACKLISTED' : 'CLEAR'
  } catch (err: any) {
    await db('blacklist_checks').insert({
      id: uuidv4(),
      user_payload_hash: value,
      adjutor_request_id: null,
      result: 'ERROR',
      raw_response: JSON.stringify(err.response?.data || err.message)
    })
    return 'ERROR'
  }
}

// check both email and phone
export async function checkBlacklist(
  email: string,
  phone: string
): Promise<Result> {
  const emailResult = await checkValue(email)
  if (emailResult !== 'CLEAR') return emailResult

  const phoneResult = await checkValue(phone)
  return phoneResult
}
