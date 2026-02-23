import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";
import MainArea from "../../components/MainArea";
import PageTitle from "../../components/PageTitle";
import CustomButton from '../../components/CustomButton';
import { AiOutlineReload } from "react-icons/ai";

const ChangePassword = () => {
  return (
    <MainArea>
      <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
        <PageTitle>Change Password</PageTitle>
        <hr />
        <table className="w-full text-sm">
          <tbody>
            <tr className="dark:bg-slate-800">
              <td className="p-1 min-w-36">Current Password</td>
              <td className="p-1 min-w-36">
                <input
                  placeholder='Current Password'
                  className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                  // value={data.gst}
                  type="text"
                // onChange={(e) =>
                //   setData({ ...data, gst: e.target.value.toLowerCase() })
                // }
                />
              </td>
            </tr>
            <tr className="dark:bg-slate-800">
              <td className="p-1 min-w-36">New Password</td>
              <td className="p-1 min-w-36">
                <input
                  placeholder='New Password'
                  className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                  // value={data.pan}
                  type="text"
                // onChange={(e) =>
                //   setData({ ...data, pan: e.target.value.toLowerCase() })
                // }
                />
              </td>
            </tr>
            <tr className="dark:bg-slate-800">
              <td className="p-1 min-w-36">Confirm New Password</td>
              <td className="p-1 min-w-36">
                <input
                  placeholder='Confirm New Password'
                  className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                  // value={data.trade_licence}
                  type="text"
                // onChange={(e) =>
                //   setData({ ...data, trade_licence: e.target.value.toLowerCase() })
                // }
                />
              </td>
            </tr>
            <tr className="dark:bg-slate-800">
              <td className="p-1 min-w-36"></td>
              <td className="p-1 min-w-36">
                <CustomButton title={"Update"} color={"blue"}><AiOutlineReload /></CustomButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </MainArea>
  )
}

export default ChangePassword