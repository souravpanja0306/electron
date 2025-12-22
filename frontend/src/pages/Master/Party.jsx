import React from 'react'
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import { Link } from "react-router-dom";
import { AiOutlineFileAdd } from "react-icons/ai";



const Party = () => {
    return (
        <>
            <PageTitle>View All Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <Link to="/add-party">
                        <CustomButton title={"New"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                    <Link to="/add-party">
                        <CustomButton title={"Delete"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>
                <MainArea>
                    <table>
                        <thead>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th></th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                        </tbody>
                    </table>
                </MainArea>
            </div>
        </>
    )
}

export default Party