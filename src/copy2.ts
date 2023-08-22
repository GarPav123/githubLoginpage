import express,{Request,Response,NextFunction} from 'express';
import passport, { Profile, } from 'passport';
import { Strategy as GitHubStrategy,StrategyOptionsWithRequest } from 'passport-github2';
import session from 'express-session';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

interface User{
  id: string;
  username: string;
  
}

function ensureAuthenticated(req:Request,res:Response,next:NextFunction){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}


const app = express();



// initializing a session

app.use(session({secret:'shhhhhh',resave: false, saveUninitialized: false}));
app.use(cors());

// initializing passport
app.use(passport.initialize());
app.use(passport.session());



// const users: User[]=[{id: 1,username:'user1',password: 'password1'}];

const githubStrategyOptions: StrategyOptionsWithRequest={
  clientID: GITHUB_CLIENT_ID as string,
  clientSecret: GITHUB_CLIENT_SECRET as string,
  callbackURL: 'http://localhost:5000/authenticate/github/callback',
  passReqToCallback: true,
};

passport.use(
  new GitHubStrategy(
    githubStrategyOptions,(req: express.Request,accessToken:string,refreshToken: string,profile: Profile,done: (err?: Error | null, profile?: any)=>void)=>{
      console.log(profile);
      const user: User={
        id: profile.id,
        username: profile.displayName,
      };
      return done(null,user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user:User, done) => {
  done(null, user);
});

// github authentication route

app.get('/authenticate/github',passport.authenticate('github'));

// github callback route
app.get('/authenticate/github/callback',passport.authenticate('github',{failureRedirect:'/'}),(req:Request,res:Response)=>{
  res.redirect('/profile');
} )

// protected route

app.get('/profile',ensureAuthenticated,(req:Request, res:Response)=>{
  if(req.user){
    const user=req.user as User;
    res.send(`Welcome to you github-authenticated profile,${user.username}`);
  }else{
    res.send("user not authenticated");
  }
})

app.get('/',(req:Request,res:Response)=>{
  res.send('home Page ');
})

app.listen(5000,()=>{
  console.log("Server is listening on http://localhost:5000");
});
