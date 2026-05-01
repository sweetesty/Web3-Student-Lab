use soroban_sdk::{
    contracttype, Address, Env, String, Symbol, Vec, BytesN,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BlogPost {
    pub id: u64,
    pub author: Address,
    pub title: String,
    pub content_hash: BytesN<32>,
    pub timestamp: u64,
    pub metadata: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Comment {
    pub author: Address,
    pub content: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ReactionType {
    Like,
    Love,
    Insightful,
    Funny,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PostMetrics {
    pub views: u64,
    pub reactions: u64,
    pub comments: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum BloggingDataKey {
    Post(u64),
    PostComments(u64),
    PostReactions(u64),
    PostMetrics(u64),
    AuthorPosts(Address),
    NextPostId,
    LatestPosts,
}

pub struct BloggingPlatform;

impl BloggingPlatform {
    pub fn create_post(env: &Env, author: Address, title: String, content_hash: BytesN<32>, metadata: String) -> u64 {
        author.require_auth();

        let id: u64 = env.storage().instance().get(&BloggingDataKey::NextPostId).unwrap_or(0);
        let post = BlogPost {
            id,
            author: author.clone(),
            title,
            content_hash,
            timestamp: env.ledger().timestamp(),
            metadata,
        };

        env.storage().persistent().set(&BloggingDataKey::Post(id), &post);
        env.storage().instance().set(&BloggingDataKey::NextPostId, &(id + 1));

        // Initialize metrics
        let metrics = PostMetrics { views: 0, reactions: 0, comments: 0 };
        env.storage().persistent().set(&BloggingDataKey::PostMetrics(id), &metrics);

        // Indexing for feed
        let mut latest: Vec<u64> = env.storage().persistent().get(&BloggingDataKey::LatestPosts).unwrap_or_else(|| Vec::new(env));
        latest.push_front(id);
        if latest.len() > 100 {
            latest.pop_back();
        }
        env.storage().persistent().set(&BloggingDataKey::LatestPosts, &latest);

        // Author posts
        let mut author_posts: Vec<u64> = env.storage().persistent().get(&BloggingDataKey::AuthorPosts(author.clone())).unwrap_or_else(|| Vec::new(env));
        author_posts.push_front(id);
        env.storage().persistent().set(&BloggingDataKey::AuthorPosts(author), &author_posts);

        // Emit event
        env.events().publish(
            (Symbol::new(env, "post_created"), id, post.author.clone()),
            post.title.clone(),
        );

        id
    }

    pub fn get_post(env: &Env, id: u64) -> Option<BlogPost> {
        // Record a view
        if let Some(mut metrics) = env.storage().persistent().get::<_, PostMetrics>(&BloggingDataKey::PostMetrics(id)) {
            metrics.views += 1;
            env.storage().persistent().set(&BloggingDataKey::PostMetrics(id), &metrics);
        }
        env.storage().persistent().get(&BloggingDataKey::Post(id))
    }

    pub fn add_comment(env: &Env, post_id: u64, author: Address, content: String) {
        author.require_auth();
        
        let comment = Comment {
            author,
            content,
            timestamp: env.ledger().timestamp(),
        };

        let mut comments: Vec<Comment> = env.storage().persistent().get(&BloggingDataKey::PostComments(post_id)).unwrap_or_else(|| Vec::new(env));
        comments.push_back(comment);
        env.storage().persistent().set(&BloggingDataKey::PostComments(post_id), &comments);

        // Update metrics
        if let Some(mut metrics) = env.storage().persistent().get::<_, PostMetrics>(&BloggingDataKey::PostMetrics(post_id)) {
            metrics.comments += 1;
            env.storage().persistent().set(&BloggingDataKey::PostMetrics(post_id), &metrics);
        }

        env.events().publish(
            (Symbol::new(env, "comment_added"), post_id),
            env.ledger().timestamp(),
        );
    }

    pub fn react_to_post(env: &Env, post_id: u64, reader: Address, reaction: ReactionType) {
        reader.require_auth();

        let mut reactions: Vec<(Address, ReactionType)> = env.storage().persistent().get(&BloggingDataKey::PostReactions(post_id)).unwrap_or_else(|| Vec::new(env));
        
        // Remove old reaction if exists
        let mut found = false;
        for i in 0..reactions.len() {
            if let Some((addr, _)) = reactions.get(i) {
                if addr == reader {
                    reactions.set(i, (reader.clone(), reaction));
                    found = true;
                    break;
                }
            }
        }

        if !found {
            reactions.push_back((reader.clone(), reaction));
            // Update metrics
            if let Some(mut metrics) = env.storage().persistent().get::<_, PostMetrics>(&BloggingDataKey::PostMetrics(post_id)) {
                metrics.reactions += 1;
                env.storage().persistent().set(&BloggingDataKey::PostMetrics(post_id), &metrics);
            }
        }

        env.storage().persistent().set(&BloggingDataKey::PostReactions(post_id), &reactions);
    }

    pub fn get_latest_posts(env: &Env) -> Vec<BlogPost> {
        let ids: Vec<u64> = env.storage().persistent().get(&BloggingDataKey::LatestPosts).unwrap_or_else(|| Vec::new(env));
        let mut posts = Vec::new(env);
        for id in ids.iter() {
            if let Some(post) = env.storage().persistent().get::<_, BlogPost>(&BloggingDataKey::Post(id)) {
                posts.push_back(post);
            }
        }
        posts
    }

    pub fn get_post_metrics(env: &Env, post_id: u64) -> PostMetrics {
        env.storage().persistent().get(&BloggingDataKey::PostMetrics(post_id)).unwrap_or(PostMetrics { views: 0, reactions: 0, comments: 0 })
    }

    pub fn get_comments(env: &Env, post_id: u64) -> Vec<Comment> {
        env.storage().persistent().get(&BloggingDataKey::PostComments(post_id)).unwrap_or_else(|| Vec::new(env))
    }
}
