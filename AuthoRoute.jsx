import { useNavigate,Navigate,Outlet } from "react-router-dom";

function AuthoRoute() {
    const navigate = useNavigate();
    const savedUser= localStorage.getItem('user');
    let user;
    if (savedUser){
        user=JSON.parse(savedUser);

    } else{
        user=null;
    }

     if (user) {
        console.log('user is logged in')
    }else {
        console.log('no user found')
    }
    // if (user) {
    //     return children
    // }
    //  navigate("/login", { replace: true });

    // return 'no user found';
    return user? <Outlet/> : <Navigate to ="/login" replace/>;
}export default AuthoRoute;