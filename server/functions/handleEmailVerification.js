// This would be your Supabase Edge Function or webhook handler
export async function handleEmailVerification(event, context) {
  const { user, timestamp } = event;
  
  const { data, error } = await supabase
    .from('users')
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      activated_at: new Date().toISOString()
    })
    .eq('email', user.email);

  if (error) {
    console.error('Error updating user verification status:', error);
    throw error;
  }

  return { statusCode: 200 };
} 