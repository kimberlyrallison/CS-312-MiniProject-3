import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'BlogDB',
    password: 'password',
    port: 5432
});

// validate user credentials
async function validateLogin( username, password ) {
    // validate user login
    const results = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [username, password])
    if( results.rowCount == 1 )
    {
        // return true if match
        return results.rows[0];
    }
    else
    {
        // if not, return false
        return undefined;
    }
};

async function createLogin( userid, name, password ) {
    await pool.query('INSERT INTO users (user_id, name, password) VALUES ($1, $2, $3)',
        [userid, name, password]);
};

// validate user credentials
async function findUser( userid ) {
    // validate user login
    return await pool.query('SELECT * FROM users WHERE user_id = $1', [userid])
};

// display information
async function showPosts() {
    // validate user login
    const results = await pool.query('SELECT * FROM blogs');
    return results.rows;
};

async function findPost( id ) {
    // validate user login
    const results = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
    if (results.rowCount == 1)
    {
        return results.rows[0];
    }
    else 
    {
        return undefined;    
    }
};

async function createPost( post ) {
    await pool.query('INSERT INTO blogs \
        (date_created, body, creator_user_id, creator_name, title) VALUES ( $1, $2, $3, $4, $5)',
        [post.date, post.content, post.userid, post.name, post.title]);
}

async function updatePost( post ) {
    await pool.query('UPDATE blogs SET \
        date_created = $1, body = $2, creator_user_id = $3, creator_name = $4, title = $5 \
        WHERE blog_id = $6', [post.date, post.content, post.userid, post.name, post.title, post.id]);
}

async function deletePost( postID ) {
    await pool.query('DELETE from blogs WHERE blog_id = $1', [postID]);
}


export {validateLogin, showPosts, findPost, createPost, updatePost, deletePost, createLogin, findUser};