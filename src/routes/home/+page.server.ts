import type { PageServerLoad } from './$types';

import prisma from '$root/lib/prisma';
import { timePosted } from '$root/utils/date';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET: PageServerLoad = async ({
	setHeaders
}: any) => {
	// get the tweets and the user data (Prisma 😍)
	const data = await prisma.tweet.findMany({
		include: { user: true },
		orderBy: { posted: 'desc' }
	});

	// get the liked tweets
	const liked = await prisma.liked.findMany({
		where: { userId: 1 },
		select: { tweetId: true }
	});

	// we just want an array of the ids
	const keys = Object.keys(liked);
	const likedTweets = keys.map(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(key: any) => liked[key].tweetId
	);

	// we can shape the data however we want
	// so our user doesn't have to pay the cost for it
	const tweets = data.map((tweet) => {
		return {
			id: tweet.id,
			content: tweet.content,
			likes: tweet.likes,
			posted: timePosted(tweet.posted),
			url: tweet.url,
			avatar: tweet.user.avatar,
			handle: tweet.user.handle,
			name: tweet.user.name,
			liked: likedTweets.includes(tweet.id)
		};
	});

	if (!tweets) {
		return { status: 400 };
	}

	setHeaders({ 'Content-Type': 'application/json' });

	return {
		tweets
	};
};
