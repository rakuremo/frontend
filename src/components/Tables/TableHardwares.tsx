import React, { useEffect, useState } from "react";
import { getHardwares } from "@/api/index";
import { format } from "date-fns";
import ReactPaginate from "react-paginate";
import Loader from "@/components/common/Loader";
import { HardwareData } from "@/types/hardwares";
import { useRouter } from "next/navigation";

interface ApiResponse {
  data: HardwareData[];
  totalPages: number;
  total: number;
}

const TableHardwares: React.FC = () => {
  const [packageData, setPackageData] = useState<HardwareData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response: ApiResponse = await getHardwares({ limit, page });
      setPackageData(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setLoading(false);
    };
    fetchData();
  }, [limit, page]);

  const handleSetLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handlePageClick = (event: { selected: number }) => {
    setPage(event.selected + 1);
  };

  const handleHardwareDetail = (id: number) => {
    router.push(`/hardwares/${id}`);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-800 dark:shadow-card sm:p-7.5">
      <div className="mt-4 flex items-center justify-between">
        <span className="text-dark dark:text-gray-100">
          View {page * limit - limit + 1} to {Math.min(page * limit, total)} of {total} results
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-dark dark:text-gray-100">View</span>
          <select
            value={limit}
            onChange={handleSetLimit}
            className="rounded border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-center dark:bg-gray-700">
                <th className="min-w-[10px] px-4 py-4 font-medium text-dark dark:text-gray-100 xl:pl-7.5">
                  Index
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-gray-100 xl:pl-7.5">
                  Hardware Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-gray-100">
                  Percent Open
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-gray-100">
                  Updated At
                </th>
                <th className="min-w-[20px] px-4 py-4 font-medium text-dark dark:text-gray-100">
                  Status
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-gray-100 xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {packageData.map((packageItem, index) => (
                <tr key={packageItem.id} className="text-center">
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 border-b">
                    <p className="text-dark dark:text-gray-100">{index + 1}</p>
                  </td>
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 xl:pl-7.5 border-b">
                    <p className="mt-[3px] text-body-sm font-medium text-dark dark:text-gray-100">
                      {packageItem.hardware_name}
                    </p>
                  </td>
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 xl:pl-7.5 border-b">
                    <p className="mt-[3px] text-body-sm font-medium text-dark dark:text-gray-100">
                      {packageItem.percent_opening_closing}
                    </p>
                  </td>
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 border-b">
                    <p className="text-dark dark:text-gray-100">
                      {format(new Date(packageItem.updatedAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </td>
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 border-b">
                    <p className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium bg-[#219653]/[0.08] text-[#219653]`}
                    >
                      {packageItem.engine_status}
                    </p>
                  </td>
                  <td className="border-[#eee] px-4 py-4 text-center align-middle dark:border-gray-600 xl:pr-7.5 border-b">
                    <div className="flex items-center justify-end space-x-3.5">
                      <button 
                        onClick={() => handleHardwareDetail(packageItem.id)}
                        className="hover:text-primary bg-blue-500 text-white rounded-full px-2 py-1 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-container mt-4 flex justify-center">
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination flex space-x-4"}
              activeClassName={"active bg-blue-500 text-white rounded-full"}
              forcePage={page - 1}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TableHardwares;