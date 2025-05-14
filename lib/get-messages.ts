export async function getMessages(locale: string) {
  try {
    return (await import(`../messages/${locale}.json`)).default
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error)
    // Fallback to Spanish if the requested locale is not available
    return (await import(`../messages/es.json`)).default
  }
}
