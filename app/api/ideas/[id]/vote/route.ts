import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

     

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("zoho_id", userId).single()
    const ideaId = Number.parseInt(params.id)
    const { vote_type } = await request.json()

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("idea_votes")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("user_id", userData.id)
      .single()

      console.log("User Data:", userData);
      console.log("Existing Vote:", existingVote);

    let result;

    // If user has already voted
    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if clicking the same button
        await supabase.from("idea_votes").delete().eq("id", existingVote.id);
        result = { vote_type: null };
      } else {
        // Update vote if changing from upvote to downvote or vice versa
        const { data } = await supabase
          .from("idea_votes")
          .update({ vote_type })
          .eq("id", existingVote.id)
          .select()
          .single();
        result = data;
      }
    } else {
      // Create new vote if user hasn't voted before
      const { data } = await supabase
        .from("idea_votes")
        .insert({
          idea_id: ideaId,
          user_id: userData.id,
          vote_type,
        })
        .select()
        .single();
      result = data;
    }

    // Get updated vote counts
    const { data: votes } = await supabase
      .from("idea_votes")
      .select("vote_type")
      .eq("idea_id", ideaId);

    // Calculate net vote count (upvotes - downvotes)
    const vote_count = votes?.reduce((acc, vote) => {
      if (vote.vote_type === 'upvote') return acc + 1;
      if (vote.vote_type === 'downvote') return acc - 1;
      return acc;
    }, 0) || 0;
    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if same type
        await supabase.from("idea_votes").delete().eq("id", existingVote.id)
        result = { user_vote: null }
      } else {
        // Update vote type
        await supabase.from("idea_votes").update({ vote_type }).eq("id", existingVote.id)
        result = { user_vote: vote_type }
      }
    } else {
      // Create new vote
      await supabase.from("idea_votes").insert({
        idea_id: ideaId,
        user_id: Number.parseInt(userData.id),
        vote_type,
      })
      result = { user_vote: vote_type }

      console.log("New Vote Created:", result);
    }

    // Get updated vote count
    const { data: idea } = await supabase.from("ideas").select("vote_count").eq("id", ideaId).single()

    return NextResponse.json({
      ...result,
      vote_count: idea?.vote_count || 0,
    })
  } catch (error) {
    console.error("Error processing vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
