"use client";
import { io } from "socket.io-client";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import CameraViewer from "@/components/HardWare/CameraViewer";
import {
  getHardwareLog,
  getHardwareProfile,
  getHardwareStatus,
  getTimers,
  postHardwareStatus,
  postHardwareParam,
  putHardwareParam,
  deleteTimer,
  sendCommand,
} from "@/api/index";
import { FaSyncAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import { Dialog } from "@headlessui/react";
import { set } from "date-fns";

interface Notification {
  topic: number;
  message: number;
}

interface Log {
  datetime: string;
  user: string;
  action: string;
}

interface Status {
  communicationStatus: string;
  currentStatus: string;
  openClosePercentage: string;
  lastAccess: string;
  currentVoltage: string;
}

interface Timer {
  id: number;
  timer: number;
  percent_opening_closing: string;
  time: string;
  days: Record<string, string>;
}

interface AddTimer {
  percent_opening_closing: string;
  time: string;
  days: Record<string, string>;
}

const DetailHardware: React.FC = () => {
  const { id } = useParams();
  const [notfound, setNotfound] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({
    communicationStatus: "",
    currentStatus: "",
    openClosePercentage: "",
    lastAccess: "",
    currentVoltage: "",
  });
  const [data, setData] = useState<Log[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [openPercentage, setOpenPercentage] = useState<string>("0.0");
  const [command, setCommand] = useState<string>("");
  const [timers, setTimers] = useState<Timer[]>([] as Timer[]);
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [editedTimer, setEditedTimer] = useState<Timer | null>(null);
  const [newTimer, setNewTimer] = useState<AddTimer>({
    percent_opening_closing: "0.0",
    time: "00:00",
    days: {
      sunday: "OFF",
      monday: "OFF",
      tuesday: "OFF",
      wednesday: "OFF",
      thursday: "OFF",
      friday: "OFF",
      saturday: "OFF",
    },
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const logsPerPage = 5;

  const fetchTimers = async () => {
    try {
      const hardware_id = {
        hardware_id: id,
      };
      const response: any = await getTimers(hardware_id);
      setTimers(response.data);
      //console.log("Timers", response.data.length);
    } catch (error) {
      console.error("Failed to fetch timers:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await getHardwareLog(id);
      if (response.statusCode === 200) {
        const fetchedLogs = response.data.map(
          (log: any) =>
            `${log.message} - ${new Date(log.time).toLocaleString("vi-VN", { hour12: false })}`,
        );
        setLogs(fetchedLogs);
      }
    } catch (error) {
      console.error("Error fetching hardware logs:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await getHardwareStatus(id);
      if (response.statusCode === 200) {
        const fetchedData = response.data;
        setStatus({
          communicationStatus: fetchedData.receiving_status,
          currentStatus: fetchedData.engine_status,
          openClosePercentage: `${fetchedData.percent_opening_closing || "N/A"} %`,
          lastAccess: new Date(fetchedData.updatedAt).toLocaleString("vi-VN", {
            hour12: false,
          }),
          currentVoltage: `${fetchedData.hardware_voltage} V`,
        });
      }
    } catch (error) {
      console.error("Error fetching hardware status:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await getHardwareProfile(id, {
        limit: logsPerPage,
        page: currentPage,
      });
      if (response.statusCode === 200) {
        //console.log("Fetch data", response.data);
        const fetchedData = response.data.map((item: any) => ({
          datetime: new Date(item.time_action).toLocaleString(),
          user: item.user_name,
          action: item.user_action,
        }));
        setData(fetchedData);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    }
  };

  const handleDeleteTimer = async (id: number) => {
    setSelectedTimer(id);
    openModal("deleteTimer");
  };

  const handleEditTimer = async (id: number) => {
    setSelectedTimer(id);
    openModal("setTimer");
  };

  const openModal = (type: string) => {
    setModalType(type);
    setIsOpen(true);
    if (type === "setTimer") {
      setEditedTimer(timers[selectedTimer]);
    }
  };

  const closeModal = () => setIsOpen(false);

  const confirmAction = async () => {
    setLoading(true);
    try {
      if (modalType === "addTimer") {
        const data = {
          ...newTimer,
          hardware_id: id,
        };
        await postHardwareParam(data);
        await fetchTimers();
        toast.success("Add Timer Success.");
      } else if (modalType === "setTimer" && editedTimer) {
        const data = {
          percent_opening_closing: editedTimer.percent_opening_closing,
          time: editedTimer.time,
          days: editedTimer.days,
          hardware_id: id,
        };
        await putHardwareParam(editedTimer.id, data);
        await fetchTimers();
        toast.success("Edit Timer Success.");
      } else if (modalType === "GO") {
        const data = {
          hardware_id: id,
          hardware_status: "GO",
          percent_opening_closing: openPercentage,
        };
        await postHardwareStatus(data);
        toast.success("Set Hardware Status Success.");
      } else if (modalType === "deleteTimer") {
        await deleteTimer(timers[selectedTimer].id);
        await fetchTimers();
        toast.success("Delete Timer Success.");
      } else if (modalType === "sendCommand") {
        const data = {
          id: id,
          command: command
        }
        await sendCommand(data);
        toast.success("Send Command Successfully.");
      } else {
        const data = {
          hardware_id: id,
          hardware_status: modalType,
          percent_opening_closing: "",
        };
        await postHardwareStatus(data);
        toast.success("Set Hardware Status Success.");
      }
    } catch (error: any) {
      toast.error(error.response.data.message || "Action Failed");
      // alert("Action Failed.");
    } finally {
      setLoading(false);
      fetchData();
      closeModal();
    }
  };

  useEffect(() => {
    fetchTimers();
    fetchLogs();
    fetchStatus();
    fetchData();

    const socket = io(process.env.API_SOCKET || "http://localhost:3001");
    //console.log("Socket: ", process.env.API_SOCKET);
    socket.on("notification", (data: Notification) => {
      //console.log("Socket notification", data);
      if (data.topic === Number(id)) {
        if (data.message === 1) {
          //console.log("Timer", data);
          fetchTimers();
        } else if (data.message === 2) {
          //console.log("Logs", data);
          fetchLogs();
        } else if (data.message === 3) {
          //console.log("Status", data);
          fetchStatus();
        }
        //console.log("Activity", data);
        fetchData();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  if (notfound) {
    return (
      <DefaultLayout>
        <div style={{ marginTop: "120px", textAlign: "center" }}>
          <h1>404 Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      </DefaultLayout>
    );
  }

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    //console.log("currentPage:", currentPage);
    const pageNumbers = [];
    const maxPageNumbersToShow = 5; // Số trang tối đa hiển thị
    const halfMaxPages = Math.floor(maxPageNumbersToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage <= halfMaxPages) {
      endPage = Math.min(totalPages, maxPageNumbersToShow);
    }

    if (currentPage + halfMaxPages >= totalPages) {
      startPage = Math.max(1, totalPages - maxPageNumbersToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`rounded px-4 py-2 text-sm font-medium ${currentPage === i ? "bg-blue-500 text-white" : "text-blue-600"}`}
        >
          {i}
        </button>,
      );
    }

    return (
      <>
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="rounded px-4 py-2 text-sm font-medium text-blue-600"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="rounded px-4 py-2 text-sm font-medium text-blue-600"
            >
              {totalPages}
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div>
        <CameraViewer hardwareId={Number(id)} />
        <div className="flex flex-col">
          {/* Action */}
          <div className="mb-8 mt-8">
            <div className="bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <h2 className="mb-4 text-center text-xl font-semibold">
                Operate (There are {timers?.length} timers currently set.)
              </h2>
              <div className="mb-4 flex justify-center space-x-10">
                <button
                  className="flex items-center rounded bg-green-500 px-10 py-4 text-xl text-white"
                  onClick={() => openModal("UP")}
                  disabled={loading}
                >
                  {loading && modalType === "UP" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  UP
                </button>
                <button
                  className="flex items-center rounded bg-yellow-500 px-10 py-4 text-xl text-white"
                  onClick={() => openModal("ST")}
                  disabled={loading}
                >
                  {loading && modalType === "ST" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  Stop
                </button>
                <button
                  className="flex items-center rounded bg-red-500 px-10 py-4 text-xl text-white"
                  onClick={() => openModal("DN")}
                  disabled={loading}
                >
                  {loading && modalType === "DN" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  DowN
                </button>
                <button
                  className="flex items-center rounded bg-gray-500 px-10 py-4 text-xl text-white"
                  onClick={() => openModal("RS")}
                  disabled={loading}
                >
                  {loading && modalType === "RS" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  Reset
                </button>
                <button
                  className="flex items-center rounded bg-primary px-10 py-4 text-xl text-white"
                  onClick={() => openModal("CF")}
                  disabled={loading}
                >
                  {loading && modalType === "CF" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  Confirm
                </button>
                <button
                  className="flex items-center rounded bg-purple-500 px-10 py-4 text-xl text-white"
                  onClick={() => openModal("addTimer")}
                  disabled={loading}
                >
                  {loading && modalType === "addTimer" && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  Add Timer
                </button>
              </div>
              <div className="mt-8 mb-4 flex justify-center">
                <input
                  type="text"
                  className="mr-2 border bg-gray-200 px-10 py-4 text-xl dark:bg-gray-700"
                  value={openPercentage}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (!isNaN(Number(value)) &&
                        Number(value) >= 0 &&
                        Number(value) <= 100 &&
                        /^(\d+(\.\d{0,1})?)?$/.test(value))
                    ) {
                      setOpenPercentage(value);
                    }
                  }}
                  onBlur={() => {
                    if (openPercentage === "") {
                      setOpenPercentage("0.0");
                    } else {
                      setOpenPercentage(parseFloat(openPercentage).toFixed(1));
                    }
                  }}
                />
                <button
                  className="flex items-center rounded bg-gray-200 px-4 py-2 text-black text-xl"
                  onClick={() => openModal("GO")}
                  disabled={loading}
                >
                  {loading && modalType === "GO" && (
                    <ClipLoader size={20} color={"#000"} className="mr-2" />
                  )}
                  Open to percentage
                </button>
              </div>
              <div className="mt-8 mb-4 flex justify-center w-full">
                <input
                  type="text"
                  className="mr-2 border bg-gray-200 px-10 py-4 text-xl dark:bg-gray-700 w-7/12"
                  value={command}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCommand(value);
                  }}
                />
                <button
                  className="flex items-center rounded bg-orange-200 px-4 py-2 text-black text-xl"
                  onClick={() => openModal("sendCommand")}
                  disabled={loading}
                >
                  {loading && modalType === "sendCommand" && (
                    <ClipLoader size={20} color={"#000"} className="mr-2" />
                  )}
                  Send Command
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <div className="bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-center text-xl font-semibold">Status</h2>
                <button
                  onClick={fetchStatus}
                  className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-700"
                >
                  <FaSyncAlt />
                </button>
              </div>
              <div className="border-t border-gray-200 text-lg">
                <div className="flex justify-between py-2">
                  <span>Communication status</span>
                  <span>{status.communicationStatus}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 py-2">
                  <span>Current status</span>
                  <span>{status.currentStatus}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 py-2">
                  <span>Open percentage</span>
                  <span>{status.openClosePercentage}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 py-2">
                  <span>Last access</span>
                  <span>{status.lastAccess}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 py-2">
                  <span>Current voltage</span>
                  <span>{status.currentVoltage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="mb-8">
            <div className="flex flex-col items-center bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <div className="mb-4 flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold">Activity log</h2>
                <button
                  onClick={fetchData}
                  className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-700"
                >
                  <FaSyncAlt />
                </button>
              </div>
              <table className="min-w-full bg-white dark:bg-gray-800 text-lg">
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                      Date and time
                    </th>
                    <th className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                      Action person
                    </th>
                    <th className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((log, index) => (
                    <tr key={index}>
                      <td className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                        {log.datetime}
                      </td>
                      <td className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                        {log.user}
                      </td>
                      <td className="border-b border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                        {log.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded px-4 py-2 text-sm font-medium ${currentPage === 1 ? "text-gray-400" : "text-blue-600"}`}
                >
                  &lt; Before
                </button>
                <div>{renderPageNumbers()}</div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`rounded px-4 py-2 text-sm font-medium ${currentPage === totalPages ? "text-gray-400" : "text-blue-600"}`}
                >
                  After &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8">
            <div className="flex flex-col items-center bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <div className="mb-4 flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold">Timer</h2>
                <button
                  onClick={fetchTimers}
                  className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-700"
                >
                  <FaSyncAlt />
                </button>
              </div>
              <table className="min-w-full rounded-lg border border-gray-200 bg-white text-lg">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">No.</th>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Body</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timers.map((post, index) => (
                    <tr key={index} className="border-t text-center">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">Timer {post.timer}</td>
                      <td className="border px-4 py-2">
                        <div className="flex flex-col">
                          <div>
                            Open:{" "}
                            <span className="text-red-500">
                              {post.percent_opening_closing} %
                            </span>
                          </div>
                          <div>
                            Time:{" "}
                            <span className="text-blue-500">{post.time}</span>
                          </div>
                          <div>
                            Days:{" "}
                            <span className="text-green-500">
                              {Object.keys(post.days)
                                .filter(
                                  (day) =>
                                    timers[selectedTimer].days[day] === "ON",
                                )
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="space-x-4 border px-4 py-2">
                        <button
                          className="mr-2 rounded bg-blue-500 px-8 py-3 font-bold text-white hover:bg-blue-700"
                          onClick={() => handleEditTimer(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded bg-red-500 px-8 py-3 font-bold text-white hover:bg-red-700"
                          onClick={() => handleDeleteTimer(index)}
                          disabled={loading}
                        >
                          {loading && modalType === "deleteTimer" && (
                            <ClipLoader
                              size={20}
                              color={"#fff"}
                              className="mr-2"
                            />
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs */}
          <div className="mb-8">
            <div className="bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-center text-xl font-semibold">Logs</h2>
                <button
                  onClick={fetchLogs}
                  className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-700"
                >
                  <FaSyncAlt />
                </button>
              </div>
              <div
                className="overflow-y-auto rounded bg-black p-4 text-white"
                style={{ height: "350px" }}
              >
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <Dialog open={isOpen} onClose={closeModal}>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded bg-white p-6">
              <Dialog.Title className="text-xl font-bold">
                {modalType == "UP" && "UP"}
                {modalType === "ST" && "Stop"}
                {modalType === "DN" && "DowN"}
                {modalType === "RS" && "Reset"}
                {modalType === "CF" && "Confirm"}
                {modalType === "addTimer" && "Add Timer"}
                {modalType === "GO" && `Open to ${openPercentage} %`}
                {modalType === "setTimer" &&
                  `Edit timer ${timers[selectedTimer].timer}`}
                {modalType === "deleteTimer" &&
                  `Delete timer ${timers[selectedTimer].timer}`}
                {modalType === "sendCommand" &&
                  `Send command directly`}
              </Dialog.Title>
              <div className="mt-4">
                {modalType === "setTimer" && editedTimer ? (
                  <>
                    <label>
                      Open percentage:
                      <input
                        type="text"
                        className="ml-2 border p-2"
                        value={editedTimer.percent_opening_closing}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (!isNaN(Number(value)) &&
                              Number(value) >= 0 &&
                              Number(value) <= 100 &&
                              /^(\d+(\.\d{0,1})?)?$/.test(value))
                          ) {
                            setEditedTimer({
                              ...editedTimer,
                              percent_opening_closing: value,
                            });
                          }
                        }}
                        onBlur={() => {
                          if (editedTimer.percent_opening_closing === "") {
                            setEditedTimer({
                              ...editedTimer,
                              percent_opening_closing: "0.0",
                            });
                          } else {
                            setEditedTimer({
                              ...editedTimer,
                              percent_opening_closing: parseFloat(
                                editedTimer.percent_opening_closing,
                              ).toFixed(1),
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      Time:
                      <input
                        type="time"
                        className="ml-2 border p-2"
                        value={editedTimer.time}
                        onChange={(e) =>
                          setEditedTimer({
                            ...editedTimer,
                            time: e.target.value,
                          })
                        }
                      />
                    </label>
                    <div>
                      Days activity:
                      {Object.keys(editedTimer.days).map((day) => (
                        <label key={day} className="block">
                          <input
                            type="checkbox"
                            checked={editedTimer.days[day] === "ON"}
                            onChange={(e) =>
                              setEditedTimer({
                                ...editedTimer,
                                days: {
                                  ...editedTimer.days,
                                  [day]: e.target.checked ? "ON" : "OFF",
                                },
                              })
                            }
                          />
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      ))}
                    </div>
                  </>
                ) : modalType === "addTimer" ? (
                  <>
                    <label>
                      Open percentage:
                      <input
                        type="text"
                        className="ml-2 border p-2"
                        value={newTimer.percent_opening_closing}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (!isNaN(Number(value)) &&
                              Number(value) >= 0 &&
                              Number(value) <= 100 &&
                              /^(\d+(\.\d{0,1})?)?$/.test(value))
                          ) {
                            setNewTimer({
                              ...newTimer,
                              percent_opening_closing: value,
                            });
                          }
                        }}
                        onBlur={() => {
                          if (newTimer.percent_opening_closing === "") {
                            setNewTimer({
                              ...newTimer,
                              percent_opening_closing: "0.0",
                            });
                          } else {
                            setNewTimer({
                              ...newTimer,
                              percent_opening_closing: parseFloat(
                                newTimer.percent_opening_closing,
                              ).toFixed(1),
                            });
                          }
                        }}
                      />
                    </label>
                    <label>
                      Time:
                      <input
                        type="time"
                        className="ml-2 border p-2"
                        value={newTimer.time}
                        onChange={(e) =>
                          setNewTimer({
                            ...newTimer,
                            time: e.target.value,
                          })
                        }
                      />
                    </label>
                    <div>
                      Days activity:
                      {Object.keys(newTimer.days).map((day) => (
                        <label key={day} className="block">
                          <input
                            type="checkbox"
                            checked={newTimer.days[day] === "ON"}
                            onChange={(e) =>
                              setNewTimer({
                                ...newTimer,
                                days: {
                                  ...newTimer.days,
                                  [day]: e.target.checked ? "ON" : "OFF",
                                },
                              })
                            }
                          />
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {modalType == "UP" &&
                      "Request the motor to rotate downwards and request to send the status."}
                    {modalType === "ST" &&
                      "Request the motor to stop and request to send the status."}
                    {modalType === "DN" &&
                      "Request the motor to rotate downwards and request to send the status."}
                    {modalType === "RS" &&
                      "Request reset to clear errors when they occur (overload error, motor driver error)."}
                    {modalType === "Confirm" && "Request to send the status."}
                    {modalType === "GO" &&
                      `Request the status and open the door to ${openPercentage}% and request to send the status.`}
                    {modalType === "deleteTimer" &&
                      `Are you sure you want to delete timer ${timers[selectedTimer].timer}?`}
                    {modalType === "sendCommand" &&
                      `Send command directly to hardware: ${command} ?`}
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="mr-2 rounded bg-gray-300 px-4 py-2 text-black"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                  onClick={confirmAction}
                  disabled={loading}
                >
                  {loading && (
                    <ClipLoader size={20} color={"#fff"} className="mr-2" />
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </DefaultLayout>
  );
};

export default DetailHardware;
