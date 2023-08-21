import express,{Request,Response} from 'express';
import axios from 'axios';
import cors from 'cors';
import * as dotenv from 'dotenv';
import queryString from 'querystring';
dotenv.config();
const app=express();
app.use(express.json());
app.use(cors());
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const params = queryString.stringify({
  client_id: GITHUB_CLIENT_ID, 
  redirect_uri: 'https://localhost:5000/authenticate/github/callback',
  scope: ['read:user', 'user:email'].join(' '), 
  allow_signup: true,
});
// console.log(params);
const githubLoginUrl=`https://github.com/login/oauth/authorize?${params}`;

async function getAccessTokenFromCode({ code }: { code: string }){
  console.log(code);
  try{
    const {data} = await axios({
      url: 'https://github.com/login/oauth/access_token',
      method: 'post',
      params:{
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5000/authenticate/github/callback',
        code,
      },
    });
    const parsedData=queryString.parse(data);
    if (parsedData.error) {
      const errorDescription = Array.isArray(parsedData.error_description)
        ? parsedData.error_description.join(' ') // Join array elements into a string
        : parsedData.error_description || ''; // Handle null or undefined by using an empty string

      throw new Error(errorDescription);
    }
    const access_token = parsedData.access_token;
    return access_token;
  }catch(error: any){
    console.error("Error getting access token", error.message);
    throw new Error('Failed to get access token');
  }

  

}

async function getGithubUserData({access_token}: {access_token: string}){
  try{
    const response=await axios.get('https://api.github.com/user',{
      headers: {
        Authorization: `token ${access_token}`,

      },
    });
    console.log(response.data);
    return response.data;
  }catch(error: any){
    console.error('Error fetching Github user data:',error.message);
    throw new Error('failed to fetch github user data');
  }

}

app.get('/', (req, res) => {
  res.send("home page");
})
app.get('/authenticate/github',(req,res)=>{
  res.redirect(githubLoginUrl);
})
app.post('/authenticate/github/callback', async (req, res) => {
  
  const code=req.query.code as string
  console.log(code);
  if (!code) {
    throw new Error("No code!");
  }

  try{
    const accessToken = await getAccessTokenFromCode({code}); 
    console.log("authentication successful");
    if (accessToken) {
      const userData = await getGithubUserData({ access_token: accessToken });
      res.send("Successfully authenticated");
    } else {
      res.status(500).send("Authentication failed: Access token not received");
    }
    
  }catch(error){
    // console.log("Authentication error:",error);
    res.status(500).send("Authentication failed");
  }
});


app.listen(5000,()=>{
  console.log('server is listening on http://localhost:5000');
});