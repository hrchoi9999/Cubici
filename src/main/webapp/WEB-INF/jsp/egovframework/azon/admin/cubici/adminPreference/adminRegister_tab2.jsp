<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div class="m-tab">
    <ul>
        <li><a href="/admin/cubici/adminPreference/adminRegister_tab1">등록 관리자</a></li>
        <li class="active"><a href="/admin/cubici/adminPreference/adminRegister_tab2">접근권한</a></li>
    </ul>
</div>

<div class="gradeAccess">
    <header>
        <div class="gradeCate cubici">
            <h4>큐빅아이</h4>
            <ul>
                <li>환경설정</li>
                <li>관리 페이지</li>
            </ul>
        </div>
        <div class="gradeCate mb">
            <h4>머니뱅크</h4>
            <ul>
                <li>관리 페이지</li>
                <li>신청 페이지</li>
            </ul>
        </div>
    </header>
    <div class="gradeList">
        <article>
            <b class="title">큐빅아이</b>
            <ul>
                <li>
                    <span>C1</span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
                <li>
                    <span>C2</span>
                    <span></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
            </ul>
        </article>
        <article>
            <b class="title">투게더펀딩 T</b>
            <ul>
                <li>
                    <span>T1</span>
                    <span class="empty col-2"></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
                <li>
                    <span>T2</span>
                    <span class="empty col-2"></span>
                    <span></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
            </ul>
        </article>
        <article>
            <b class="title">헬로펀딩 H</b>
            <ul>
                <li>
                    <span>H1</span>
                    <span class="empty col-2"></span>
                    <span><i class="oiBtn check"></i></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
                <li>
                    <span>H2</span>
                    <span class="empty col-2"></span>
                    <span></span>
                    <span><i class="oiBtn check"></i></span>
                </li>
            </ul>
        </article>
    </div>
</div>

<div class="subContentsBtns">
    <a href="javascript:;" class="mBtn sColorN">취소</a>
    <a href="javascript:;" class="mBtn sColorLB modalOpen" data-modal="join-release">확인</a>
</div>