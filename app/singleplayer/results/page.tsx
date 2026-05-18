"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ConfigProvider, Table, message } from "antd";
import { TrophyFilled } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";

interface ResultRow {
	key: string;
	round: string;
	game: "Reaction Time" | "Typing Speed" | "Time Interval" | "Aim Test" | "Click Speed" | "Quick Math";
	score: string;
	rawScore: number;
}

const toNumberArray = (raw: string | null): number[] => {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((value) => Number(value))
			.filter((value) => Number.isFinite(value));
	} catch {
		return [];
	}
};

const ResultsPage: React.FC = () => {
	const router = useRouter();
	const apiService = useApi();
	const { value: userId } = useLocalStorage<string>("userId", "");
	const { value: token } = useLocalStorage<string>("token", "");
	const [rows, setRows] = useState<ResultRow[]>([]);
	const [highScoreRowKeys, setHighScoreRowKeys] = useState<string[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const reactionScores = toNumberArray(globalThis.sessionStorage.getItem("reactionScores"));
		const typingScores = toNumberArray(globalThis.sessionStorage.getItem("typingScores"));
		const timeIntervalScores = toNumberArray(
			globalThis.sessionStorage.getItem("timeIntervalScores"),
		);
		const aimTestScores = toNumberArray(globalThis.sessionStorage.getItem("aimTestScores"));
		const clickSpeedScores = toNumberArray(
			globalThis.sessionStorage.getItem("clickSpeedScores"),
		);
		const quickMathScores = toNumberArray(
			globalThis.sessionStorage.getItem("quickMathScores"),
		);

		const reactionRows: ResultRow[] = reactionScores.map((score, index) => ({
			key: `reaction-${index}`,
			round: `${index + 1}.`,
			game: "Reaction Time",
			score: score === -1 ? "Failed" : `${score} ms`,
			rawScore: score,
		}));

		const typingRows: ResultRow[] = typingScores.map((score, index) => ({
			key: `typing-${index}`,
			round: `${reactionRows.length + index + 1}.`,
			game: "Typing Speed",
			score: `${score} wpm`,
			rawScore: score,
		}));

		const timeIntervalRows: ResultRow[] = timeIntervalScores.map((score, index) => ({
			key: `time-interval-${index}`,
			round: `${reactionRows.length + typingRows.length + index + 1}.`,
			game: "Time Interval",
			score: score === -1 ? "Failed" : `${score.toFixed(3)}s off`,
			rawScore: score,
		}));

		const aimTestRows: ResultRow[] = aimTestScores.map((score, index) => ({
			key: `aim-test-${index}`,
			round: `${reactionRows.length + typingRows.length + timeIntervalRows.length + index + 1}.`,
			game: "Aim Test",
			score: `${score} points`,
			rawScore: score,
		}));

		const clickSpeedRows: ResultRow[] = clickSpeedScores.map((score, index) => ({
			key: `click-speed-${index}`,
			round: `${
				reactionRows.length +
				typingRows.length +
				timeIntervalRows.length +
				aimTestRows.length +
				index +
				1
			}.`,
			game: "Click Speed",
			score: `${score.toFixed(2)} clicks/s`,
			rawScore: score,
		}));

		const quickMathRows: ResultRow[] = quickMathScores.map((score, index) => ({
			key: `quick-math-${index}`,
			round: `${
				reactionRows.length +
				typingRows.length +
				timeIntervalRows.length +
				aimTestRows.length +
				clickSpeedRows.length +
				index +
				1
			}.`,
			game: "Quick Math",
			score: `${score} pts`,
			rawScore: score,
		}));

		const nextRows = [
			...reactionRows,
			...typingRows,
			...timeIntervalRows,
			...aimTestRows,
			...clickSpeedRows,
			...quickMathRows,
		];
		setRows(nextRows);

		// Calculate best scores for high-score submission and row highlighting
		const validReactionScores = reactionScores.filter((s) => s !== -1);
		const validTimeIntervalScores = timeIntervalScores.filter((s) => s !== -1);
		const bestReaction =
			validReactionScores.length > 0 ? Math.min(...validReactionScores) : null;
		const bestTyping = typingScores.length > 0 ? Math.max(...typingScores) : null;
		const bestTimeInterval =
			validTimeIntervalScores.length > 0 ? Math.min(...validTimeIntervalScores) : null;
		const bestAim = aimTestScores.length > 0 ? Math.max(...aimTestScores) : null;
		const bestClickSpeed = clickSpeedScores.length > 0 ? Math.max(...clickSpeedScores) : null;
		const bestQuickMath = quickMathScores.length > 0 ? Math.max(...quickMathScores) : null;

		const submitHighScores = async () => {
			try {
				interface HighScoreResponse {
					reactionHighScoreUpdated: boolean;
					typingHighScoreUpdated: boolean;
					timeIntervalHighScoreUpdated: boolean;
					aimTestHighScoreUpdated: boolean;
					clickSpeedHighScoreUpdated: boolean;
					quickMathHighScoreUpdated: boolean;
				}

				const response = await apiService.put<HighScoreResponse>(
					`/users/${userId}/highscores`,
					{
						reactionScores: reactionScores.length > 0 ? reactionScores : [],
						typingScores: typingScores.length > 0 ? typingScores : [],
						timeIntervalScores: timeIntervalScores.length > 0 ? timeIntervalScores : [],
						aimTestScores: aimTestScores.length > 0 ? aimTestScores : [],
						clickSpeedScores: clickSpeedScores.length > 0 ? clickSpeedScores : [],
						quickMathScores: quickMathScores.length > 0 ? quickMathScores : [],
					},
					{ Authorization: `Bearer ${token}` }
				);

				const nextHighScoreRowKeys = nextRows
					.filter((row) => {
						if (row.rawScore === -1) return false;
						if (
							response.reactionHighScoreUpdated &&
							row.game === "Reaction Time" &&
							row.rawScore === bestReaction
						) return true;
						if (
							response.typingHighScoreUpdated &&
							row.game === "Typing Speed" &&
							row.rawScore === bestTyping
						) return true;
						if (
							response.aimTestHighScoreUpdated &&
							row.game === "Aim Test" &&
							row.rawScore === bestAim
						) return true;
						if (
							response.clickSpeedHighScoreUpdated &&
							row.game === "Click Speed" &&
							row.rawScore === bestClickSpeed
						) return true;
						if (
							response.quickMathHighScoreUpdated &&
							row.game === "Quick Math" &&
							row.rawScore === bestQuickMath
						) return true;
						return (
							response.timeIntervalHighScoreUpdated &&
							row.game === "Time Interval" &&
							row.rawScore === bestTimeInterval
						);
					})
					.map((row) => row.key);

				setHighScoreRowKeys(nextHighScoreRowKeys);

				if (response.reactionHighScoreUpdated && bestReaction !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Reaction Time (${bestReaction} ms)`,
					});
				}

				if (response.typingHighScoreUpdated && bestTyping !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Typing Speed (${bestTyping} WPM)`,
					});
				}

				if (response.timeIntervalHighScoreUpdated && bestTimeInterval !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Time Interval (${bestTimeInterval.toFixed(3)}s)`,
					});
				}
				if (response.aimTestHighScoreUpdated && bestAim !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Aim Test (${bestAim})`,
					});
				}
				if (response.clickSpeedHighScoreUpdated && bestClickSpeed !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Click Speed (${bestClickSpeed})`,
					});
				}
				if (response.quickMathHighScoreUpdated && bestQuickMath !== null) {
					message.open({
						type: "success",
						icon: <TrophyFilled style={{ color: "#faad14" }} />,
						content: `New High Score: Quick Math (${bestQuickMath})`,
					});
				}
			} catch (error) {
				console.error("Error submitting high scores:", error);
			}
		};

		if (
			userId &&
			token &&
			(reactionScores.length > 0 || typingScores.length > 0 || timeIntervalScores.length > 0 || aimTestScores.length > 0 || clickSpeedScores.length > 0 || quickMathScores.length > 0)
		) {
			submitHighScores();
		}
	}, [userId, token]);

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#6BAED6",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
			}}
		>
			<div className="back-button-anchor">
				<Link href={`/users/${userId}`}>
					<Button type="primary" className="back-button">
						Back to Profile
					</Button>
				</Link>

				<Button
					type="primary"
					onClick={() => router.push("/singleplayer")}
					className="back-button"
				>
					Back to Games
				</Button>
			</div>

			<div
				style={{
					width: "100%",
					maxWidth: "760px",
					backgroundColor: "#B8D8E8",
					borderRadius: "16px",
					padding: "1rem",
					boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
				}}
			>
				<ConfigProvider //without this the background color of the table is dark gray, this overrides that
					theme={{
						token: {
							fontFamily: "var(--font-chewy)",
							fontSize: 22,
						},
						components: {
							Table: {
								headerBg: "#B8D8E8",
								headerColor: "#000000",
								colorBgContainer: "#B8D8E8",
								borderColor: "rgba(0,0,0,0.2)",
							},
						},
					}}
				>
					<Table<ResultRow>
						columns={[
							{
								title: "Round",
								dataIndex: "round",
								key: "round",
								width: "20%",
							},
							{
								title: "Game",
								dataIndex: "game",
								key: "game",
								width: "40%",
							},
							{
								title: "Score",
								dataIndex: "score",
								key: "score",
								width: "40%",
								render: (text: string, record: ResultRow) => {
									const isHighScore = highScoreRowKeys.includes(record.key);

									return (
										<span style={{ fontWeight: isHighScore ? "bold" : "normal" }}>
											{isHighScore && (
												<TrophyFilled
													style={{ color: "#faad14", marginRight: "0.5rem" }}
												/>
											)}
											{text}
										</span>
									);
								},
							},
						]}
						dataSource={rows}
						pagination={false}
						scroll={{ y: 8 * 54 }}
						locale={{ emptyText: "No session scores found." }}
					/>
				</ConfigProvider>
			</div>
		</div>
	);
};

export default ResultsPage;
