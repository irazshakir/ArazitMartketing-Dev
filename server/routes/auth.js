// ... existing imports ...

// Add this new route to get current user from session
router.get('/auth/current-user', async (req, res) => {
  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*, users!inner(*)')
      .eq('session_token', req.cookies.session_token)
      .single();

    if (error || !session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      user_id: session.user_id,
      name: session.users.name,
      email: session.users.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current user', error });
  }
});

// ... rest of the routes ... 