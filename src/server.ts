import app from './app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Demo Credit Wallet API running on port ${PORT}`)
})
